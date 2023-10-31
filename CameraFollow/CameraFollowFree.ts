import { TargetMove } from "../TagetMove/TargetMove";
import { ICameraData, ICameraFollow } from "./interface/ICameraData";

export class CameraFollowFree  implements ICameraFollow {

    //#region 相机配置参数
    private _touchArea: Laya.Sprite;
    private _camera: Laya.Camera;
    private _target: any;
    private _upangle: number = 0
    private _downangle: number = 0
    private _offsetPos: Laya.Vector3
    //#endregion

    //#region 鼠标控制参数
    private _lastMouseX: number;
    private _lastMouseY: number;
    private _rotationEuler: Laya.Vector3 = new Laya.Vector3();
    private _isMouseDown: boolean;
    private _controlEnable: boolean = true//是否操作相机
    private _touchid: number = -1
    //#endregion

    //#region 相机移动旋转参数
    private _cameraTarget:Laya.Sprite3D; //相机父节点
    private _cameraTargetPos: Laya.Vector3 //相机父节点位置
    private _cameraTargetRot: Laya.Vector3 //相机父节点旋转
    private _upVector: Laya.Vector3 = new Laya.Vector3(0, 1, 0)
    private _positionSpeed: number = 1; //位置跟随速度
    private _rotaionSpeed: number = 0.01; //旋转跟随速度
    private _lastRotationY: number = 0;
    //#endregion




    initCamera(data: ICameraData): void {
        this._camera = data.camera;
        this._target = data.target.owner;
        this._touchArea = data.touchArea;
        this._offsetPos = data.posOffset || new Laya.Vector3();
        this._upangle = data.upAngle || 0;
        this._downangle = data.downangle || 0;
   
        this._cameraTargetPos = new Laya.Vector3()
        this._cameraTargetRot = new Laya.Vector3()
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
            this._cameraTarget.transform.localRotationEuler.cloneTo(this._cameraTargetRot);
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
        this._rotationEuler.setValue(this._cameraTarget.transform.localRotationEulerX, this._cameraTarget.transform.localRotationEulerY, this._cameraTarget.transform.localRotationEulerZ)
        this._lastMouseX = Laya.stage.mouseX;
        this._lastMouseY = Laya.stage.mouseY;
        this._isMouseDown = true;
    }

    private mouseMove(e: Laya.Event) {
        if (!this._controlEnable) return;

        if (e.touchId == this._touchid) {
            //旋转处理
            var elapsedTime = Laya.timer.delta;
            if (!isNaN(this._lastMouseX) && !isNaN(this._lastMouseY) && this._isMouseDown) {
                var offsetX = Laya.stage.mouseY - this._lastMouseY;
                var offsetY = Laya.stage.mouseX - this._lastMouseX;

                this._rotationEuler.x -= offsetX * this._rotaionSpeed * elapsedTime;
                this._rotationEuler.y -= offsetY * this._rotaionSpeed * elapsedTime;
                if (Math.abs(this._rotationEuler.y - this._lastRotationY) > 1) {
                    this._lastRotationY = this._rotationEuler.y;
                }
                this.sysRotation();//同步旋转
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



    //同步旋转
    protected sysRotation(): void {
        if (this._upangle) {
            if (this._rotationEuler.x < (-this._upangle)) this._rotationEuler.x = (-this._upangle)
        }
        if (this._downangle) {
            if (this._rotationEuler.x > this._downangle) this._rotationEuler.x = this._downangle
        }
        this._cameraTarget.transform.localRotationEuler = this._rotationEuler;
        let targetMove = this._target.getComponent(TargetMove);
        targetMove.offsetAngle = this._rotationEuler.y
    }
    //同步位置
    private sysPosition(): void {
        Laya.Vector3.lerp(this._cameraTargetPos, this._target.transform.position, this._positionSpeed, this._cameraTargetPos);
        this._cameraTarget.transform.position = this._cameraTargetPos.clone()
        if (this._controlEnable) {
            //玩家控制相机旋转
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
