import {createHash} from 'node:crypto';
import type {UploadAd} from './meta-uploader-model';
export function itemKey(ad:UploadAd){return createHash('sha256').update(JSON.stringify([ad.accountId,ad.adSetId,ad.key])).digest('hex');}
export function fingerprint(ad:UploadAd){return createHash('sha256').update(JSON.stringify(ad)).digest('hex');}
