import { TargetMove } from "../TagetMove/TargetMove";
import { ICameraData, ICameraFollow } from "./interface/ICameraData";

export class CameraFollow2D implements ICameraFollow {

    //#region 相机配置参数
    private _mapArea: Laya.Sprite;
    private _target: any;
    private _targetMove: TargetMove; //目标移动逻辑
    private _dragRect: Laya.Rectangle;
    private _touchArea: Laya.Sprite;
    //#endregion


    initCamera(data: ICameraData): void {
        this._targetMove = data.target;
        this._mapArea = data.mapArea;  
        this._touchArea = data.touchArea;     
        this._target = this._targetMove.owner;
        if(this._mapArea){
            this.updateDragRect();
            if(this._touchArea){
                this._touchArea.on(Laya.Event.MOUSE_DOWN, this, this.beginDragRect);
                this._touchArea.on(Laya.Event.MOUSE_UP, this, this.endDragRect);
                this._touchArea.on(Laya.Event.MOUSE_OUT, this, this.endDragRect);
            }
        }
    }


    //#region 摄像机拖动逻辑
    beginDragRect(){
        this._mapArea.startDrag(this._dragRect);
    }

    updateDragRect() {
        let hwidth = Laya.stage.displayWidth;
        let hheight = Laya.stage.displayHeight;
        let minX = Math.min((hwidth - this._mapArea.displayWidth), (this._mapArea.displayWidth - hwidth));
        let maxX = Math.max((hwidth - this._mapArea.displayWidth), (this._mapArea.displayWidth - hwidth));
        let minY = Math.min((hheight - this._mapArea.displayHeight), (this._mapArea.displayHeight - hheight))
        let maxY = Math.max((hheight - this._mapArea.displayHeight), (this._mapArea.displayHeight - hheight))
        this._dragRect = new Laya.Rectangle(minX, minY, maxX, maxY);
    }

    endDragRect(){
        this._mapArea.stopDrag();
    }

    //#endregion




    onLateUpdate(): void {
        if (this._target) {
            //位置处理
            this.sysPosition()
        }
    }


    //同步位置
    private sysPosition(): void {
        //移动的坐标向量为：摇杆弧度下的坐标向量比率（斜边比）乘以移动速度
        if(this._targetMove.isMoving){
            let dx = Math.cos(this._targetMove.curRadian) * this._targetMove.curSpeed;
            let dy = Math.sin(this._targetMove.curRadian) * this._targetMove.curSpeed;
            //通过反向移动地图，形成角色位移的视觉效果
            if((dx < 0 && this._mapArea.x < 0) || (dx > 0 && this._mapArea.x > Laya.stage.displayWidth - this._mapArea.displayWidth)){
                this._mapArea.x -= dx
            }
               
            if((dy < 0 && this._mapArea.y < 0) || (dy > 0 && this._mapArea.y > Laya.stage.displayHeight - this._mapArea.displayHeight)) {
                this._mapArea.y -= dy;
            }

           
        }
       
    }


    public onDisable(): void {
        if(this._touchArea){
            this._touchArea.off(Laya.Event.MOUSE_DOWN, this, this.beginDragRect);
            this._touchArea.off(Laya.Event.MOUSE_UP, this, this.endDragRect);
            this._touchArea.off(Laya.Event.MOUSE_OUT, this, this.endDragRect);
        }
        this._target = null
    }
}
