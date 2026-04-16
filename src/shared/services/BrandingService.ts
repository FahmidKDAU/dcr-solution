import { PnPSetup } from './PnPSetup';
import { BrandingConfig, DEFAULT_BRANDING } from '../types/BrandingConfig';

const BRANDING_LIST_TITLE = 'Portal Branding';
const CACHE_KEY = 'dcr_branding_config';
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

interface CachedBranding {
  config: BrandingConfig;
  timestamp: number;
}

export class BrandingService {
  /**
   * Fetches branding config from the "Portal Branding" SharePoint list.
   * Falls back to defaults if the list doesn't exist or is empty.
   * Caches the result in sessionStorage for 30 minutes.
   */
  public static async getBrandingConfig(): Promise<BrandingConfig> {
    // Check cache first
    const cached = BrandingService.getFromCache();
    if (cached) return cached;

    try {
      const sp = PnPSetup.getSP();
      const items = await sp.web.lists
        .getByTitle(BRANDING_LIST_TITLE)
        .items
        .select(
          'Title',       // CompanyName
          'LogoUrl',
          'PrimaryColor',
          'SecondaryColor',
          'AccentColor'
        )
        .top(1)();

      if (items.length === 0) {
        BrandingService.setCache(DEFAULT_BRANDING);
        return DEFAULT_BRANDING;
      }

      const item = items[0];
      const config: BrandingConfig = {
        companyName: item.Title || DEFAULT_BRANDING.companyName,
        logoUrl: item.LogoUrl?.Url || item.LogoUrl || DEFAULT_BRANDING.logoUrl,
        primaryColor: item.PrimaryColor || DEFAULT_BRANDING.primaryColor,
        secondaryColor: item.SecondaryColor || DEFAULT_BRANDING.secondaryColor,
        accentColor: item.AccentColor || DEFAULT_BRANDING.accentColor,
      };

      BrandingService.setCache(config);
      return config;
    } catch (error) {
      console.warn('BrandingService: Could not load branding config, using defaults.', error);
      return DEFAULT_BRANDING;
    }
  }

  private static getFromCache(): BrandingConfig | null {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;

      const cached: CachedBranding = JSON.parse(raw);
      if (Date.now() - cached.timestamp > CACHE_DURATION_MS) {
        sessionStorage.removeItem(CACHE_KEY);
        return null;
      }
      return cached.config;
    } catch {
      return null;
    }
  }

  private static setCache(config: BrandingConfig): void {
    try {
      const cached: CachedBranding = { config, timestamp: Date.now() };
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    } catch {
      // sessionStorage unavailable — silently ignore
    }
  }
}
