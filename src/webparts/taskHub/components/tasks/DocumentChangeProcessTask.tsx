import React from 'react'
import { IChangeRequest } from '../../../../shared/types/ChangeRequest';
import { SharePointPerson } from '../../../../shared/types/SharePointPerson';
import { Task } from '../../../../shared/types/Task';
import { useParticipants } from '../../../../shared/hooks/useParticipants';


interface DocumentChangeProcessTaskProps { 
    task : Task; 
    cr: IChangeRequest;
    currentUser: SharePointPerson; 
    onTaskComplete: () => void; 
}



const DocumentChangeProcessTask = ({task, cr, currentUser, onTaskComplete}: DocumentChangeProcessTaskProps) => { 
    const { contributors, reviewers, loading, refetch } = useParticipants(cr.ID); 

    const isAuthor = cr.Author0?.Id === currentUser.Id; 
    const isCa = cr.ChangeAuthority?.Id === currentUser.Id;

    console.log("DocumentChangeProcessTask - Participants:", { contributors, reviewers, isAuthor, isCa });


    
    
  return (
    <div>DocumentChangeProcessTask</div>
  )
}


export default DocumentChangeProcessTask