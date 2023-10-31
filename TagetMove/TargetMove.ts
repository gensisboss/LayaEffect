import { IControlTarget } from "../Rocker/interface/IControlTarget";
import { TargetMove2D } from "./TargetMove2D";
import { TargetMove3D } from "./TargetMove3D";
import { TargetMovePhysic2D } from "./TargetMovePhysic2D";
import { TargetMovePhysic3D } from "./TargetMovePhysic3D";
import { ITargetMove } from "./interface/ITargetMove";

const { regClass, property,classInfo } = Laya;

@regClass()
@classInfo( {
    menu : "TargetControl",
    caption : "TargetMove",
})
export class TargetMove extends Laya.Component implements IControlTarget {

    @property({ type: Boolean, tips: "是否是2D物体" })
    public is2D: boolean;
    @property({ type: Boolean, tips: "是否使用物理移动" })
    public isPhysic: boolean;
    @property({ type: Number, tips: "最大移动速度" })
    public maxSpeed: number = 100;

    /**
     * 当前移动速度
     */
    public curSpeed:number= 0;
    /**
     * 当前移动角度
     */
    public curAngle:number= 0;
    /**
     * 当前移动弧度
     */
    public curRadian:number= 0;
    //偏移角度：针对当摄像机影响物体的旋转时
    public offsetAngle:number = 0;
    //是否正在移动
    public isMoving: boolean;
    private _moveLogic : ITargetMove
    onStart() {
        this.setMoveLogic(this.is2D,this.isPhysic)
    }

    setMoveLogic(is2D:boolean,isPhysic:boolean){
        if(is2D){
            if(isPhysic){
                this._moveLogic = new TargetMovePhysic2D(this.owner);
            }else{
                this._moveLogic = new TargetMove2D(this.owner);
            }
        }else{
            if(isPhysic){
                this._moveLogic = new TargetMovePhysic3D(this.owner);
            }else{
                this._moveLogic = new TargetMove3D(this.owner);
            }
        }
    }

    onUpdate(): void {
        if(this.isMoving){
            this._moveLogic.onUpdate && this._moveLogic.onUpdate();
        }
    }

    onBegin(): void {
        this._moveLogic && this._moveLogic.onBegin();
    }
    onMove(curDis: number, curAngle: number): void {
        this.isMoving = true;
        this.curSpeed = curDis*this.maxSpeed*Laya.timer.delta/1000;
        this.curAngle = curAngle;
        this.curRadian = curAngle*Math.PI/180;   
        this._moveLogic && this._moveLogic.onMove(this.curSpeed, this.curAngle,this.offsetAngle); 
    }
    onEnd(): void {
        this.curSpeed = 0;
        this.isMoving = false;
        this._moveLogic && this._moveLogic.onEnd();
    }
}