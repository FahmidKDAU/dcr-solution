import { spfi, SPFI, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';

let _sp: SPFI;

export class PnPSetup {
  public static initialize(context: any): void {
    _sp = spfi().using(SPFx(context));
    console.log('PnP initialized');
  }
   
  
  public static getSP(): SPFI {
    if (!_sp) {
      throw new Error('PnPSetup not initialized. Call initialize() first.');
    }
    console.log(_sp)
    return _sp;
  }
}