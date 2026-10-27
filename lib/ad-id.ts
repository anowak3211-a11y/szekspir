export function displayAdId(adId?:string,isImage=false){
 if(!adId)return '';
 return adId.replace(/^MEL-(\d+)$/i,`${isImage?'IMG':'VID'}-$1`);
}
