import { IMarble } from "../types/marble.types";

 export class cartItem{
    marbel!:IMarble;
    count:number=1;
    
    constructor(marbel:IMarble,count:number){
        this.marbel =marbel;
        this.count=count;
    }}