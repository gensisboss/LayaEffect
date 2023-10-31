import { TargetMove } from "../TagetMove/TargetMove";
import { ICameraData, ICameraFollow } from "./interface/ICameraData";

export class CameraFollowTail implements ICameraFollow {

    //#region 相机配置参数
    private _camera: Laya.Camera;
    private _target: any;
    private _offsetPos: Laya.Vector3
    //#endregion

  

    //#region 相机移动旋转参数
    private _cameraTarget:Laya.Sprite3D; //相机父节点
    private _cameraTargetPos: Laya.Vector3 //相机父节点位置
    private _cameraTargetRot: Laya.Vector3 //相机父节点旋转
    private _upVector: Laya.Vector3 = new Laya.Vector3(0, 1, 0)
    private _positionSpeed: number = 0.01; //位置跟随速度
    private _rotationSpeed: number = 1; //位置跟随速度
    //#endregion



    


    initCamera(data: ICameraData): void {
        this._camera = data.camera;
        this._target = data.target.owner;
        this._offsetPos = data.posOffset || new Laya.Vector3();
   
        this._cameraTargetPos = new Laya.Vector3()
        this._cameraTargetRot = new Laya.Vector3()
        
        if (this._target) {
            //初始相机位置
            this._cameraTarget = new Laya.Sprite3D("cameraParent");
            this._camera.parent.addChild(this._cameraTarget);
            this._target.transform.position.cloneTo(this._cameraTargetPos)
            this._cameraTarget.transform.position = this._cameraTargetPos.clone();
            this._cameraTarget.addChild(this._camera);
            this._camera.transform.localPosition = this._offsetPos;
            //初始相机角度
            this._camera.transform.lookAt(this._cameraTargetPos, this._upVector, false);
            this._cameraTarget.transform.localRotationEuler.cloneTo(this._cameraTargetRot);
        }

    }


    onLateUpdate(): void {
        if (this._target && this._target.transform && this._cameraTarget) {
            //位置处理
            this.sysPosition()
            this.sysRotation();
        }
    }

    //同步旋转
    protected sysRotation(): void {
        Laya.Vector3.lerp(this._cameraTargetRot, this._target.transform.localRotationEuler, this._rotationSpeed, this._cameraTargetRot);
        this._cameraTarget.transform.localRotationEuler = this._cameraTargetRot.clone()
    }
    //同步位置
    private sysPosition(): void {
        Laya.Vector3.lerp(this._cameraTargetPos, this._target.transform.position, this._positionSpeed, this._cameraTargetPos);
        this._cameraTarget.transform.position = this._cameraTargetPos.clone()
        this._camera.transform.lookAt(this._cameraTargetPos, this._upVector, false)
    }


    onDisable(): void {
        Laya.stage.offAllCaller(this)
        this._target = null
        this._camera = null
    }
}
