import backend from './vercel.backend.json';
// Frontend deployments must never register backend queue consumers or scheduled workers.
export const config = process.env.APP_SHARED_API_ORIGIN
 ? {regions:['fra1'],git:{deploymentEnabled:{'collab/bakki77':true,main:false}}}
 : backend;
