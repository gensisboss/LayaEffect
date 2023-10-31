import { TargetMove } from "../TagetMove/TargetMove";
import { ICameraData, ICameraFollow } from "./interface/ICameraData";

export class CameraFollowFix implements ICameraFollow {

    //#region 相机配置参数
    private _touchArea: Laya.Sprite;
    private _camera: Laya.Camera;
    private _target: any;
    private _offsetPos: Laya.Vector3
    //#endregion

    //#region 鼠标控制参数
    private _lastMouseX: number;
    private _lastMouseY: number;
    private _dragOffset: Laya.Vector3 = new Laya.Vector3();
    private _isMouseDown: boolean;
    private _controlEnable: boolean = true//是否操作相机
    private _touchid: number = -1
    private _dragSpeed:number = 0.001;
    //#endregion

    //#region 相机移动旋转参数
    private _cameraTarget:Laya.Sprite3D; //相机父节点
    private _cameraTargetPos: Laya.Vector3 //相机父节点位置
    private _cameraOffsetPos: Laya.Vector3 //相机位置
    private _upVector: Laya.Vector3 = new Laya.Vector3(0, 1, 0)
    private _positionSpeed: number = 0.01; //位置跟随速度
    //#endregion



 

    initCamera(data: ICameraData): void {
        this._camera = data.camera;
        this._target = data.target.owner;
        this._touchArea = data.touchArea;
        this._offsetPos = data.posOffset || new Laya.Vector3();
      
        this._cameraTargetPos = new Laya.Vector3()
        this._cameraOffsetPos = new Laya.Vector3()
        if (this._touchArea) {
            this._controlEnable = true;
            this._touchArea.on(Laya.Event.MOUSE_DOWN, this, this.mouseDown);
        } else {
            this._controlEnable = false;
        }
        if (this._target) {
            //初始相机位置
            this._cameraTarget = new Laya.Sprite3D("cameraParent");
            this._camera.parent.addChild(this._cameraTarget);
            this._target.transform.position.cloneTo(this._cameraTargetPos)
            this._cameraTarget.transform.position = this._cameraTargetPos.clone();
            this._cameraTarget.addChild(this._camera);
            this._camera.transform.localPosition = this._offsetPos;
            //初始相机角度
            this._camera.transform.lookAt(this._target.transform.position, this._upVector, false);
        }

    }


    onLateUpdate(): void {
        if (this._target && this._target.transform && this._cameraTarget) {
            //位置处理
            this.sysPosition()
        }
    }



    //#region 鼠标控制逻辑
    private mouseDown(e: Laya.Event): void {
        if (!this._controlEnable) return;
        if (this._touchid != -1) return
        Laya.stage.on(Laya.Event.BLUR, this, this.mouseUp);
        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.mouseMove);
        Laya.stage.on(Laya.Event.MOUSE_UP, this, this.mouseUp);
        Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.mouseUp);
        this._touchid = e.touchId;
        this._lastMouseX = Laya.stage.mouseX;
        this._lastMouseY = Laya.stage.mouseY;
        this._isMouseDown = true;
    }

    private mouseMove(e: Laya.Event) {
        if (!this._controlEnable) return;

        if (e.touchId == this._touchid) {
            //拖动处理
            var elapsedTime = Laya.timer.delta;
            if (!isNaN(this._lastMouseX) && !isNaN(this._lastMouseY) && this._isMouseDown) {
                var offsetX = Laya.stage.mouseX - this._lastMouseX;
                var offsetY = Laya.stage.mouseY - this._lastMouseY;
                this._dragOffset.x += offsetX * this._dragSpeed*elapsedTime;
                this._dragOffset.z += offsetY * this._dragSpeed*elapsedTime;
                this._lastMouseX = Laya.stage.mouseX;
                this._lastMouseY = Laya.stage.mouseY;
            }
        }
    }


    private mouseUp(e: Laya.Event): void {
        if (e.touchId != this._touchid) return;
        Laya.stage.off(Laya.Event.BLUR, this, this.mouseUp);
        Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.mouseMove);
        Laya.stage.off(Laya.Event.MOUSE_UP, this, this.mouseUp);
        Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.mouseUp);
        this._isMouseDown = false;
        this._touchid = -1
    }
    //#endregion



  
    //同步位置
    private sysPosition(): void {
        Laya.Vector3.lerp(this._cameraTargetPos, this._target.transform.position, this._positionSpeed, this._cameraTargetPos);
        this._cameraTarget.transform.position = this._cameraTargetPos.clone()
        if (this._controlEnable) {
            //玩家控制相机旋转
            Laya.Vector3.add(this._dragOffset,this._offsetPos,this._cameraOffsetPos)
            this._camera.transform.localPosition = this._cameraOffsetPos.clone();
        } else {
            //相机自动旋转
            this._camera.transform.lookAt(this._cameraTargetPos, this._upVector, false)
        }
    }


    public onDisable(): void {
        if (this._touchArea) {
            this._touchArea.off(Laya.Event.MOUSE_DOWN, this, this.mouseDown);
        }
        Laya.stage.offAllCaller(this)
        this._target = null
        this._camera = null
        this._touchid = -1
    }
}
