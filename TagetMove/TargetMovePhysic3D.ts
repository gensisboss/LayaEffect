import { ITargetMove } from "./interface/ITargetMove";

export class TargetMovePhysic3D implements ITargetMove {


    role: Laya.Sprite3D
    private _forwardlenth: Laya.Vector3;
    constructor(role: any) {
        this.role = role;
        this._forwardlenth = new Laya.Vector3();
    }



    onBegin(): void {

    }

    onUpdate(): void {
        let rigBody = this.role.getComponent(Laya.Rigidbody3D);
        if (rigBody) {
            rigBody.linearVelocity = this._forwardlenth;
        }
    }

    onMove(curDis: number, curAngle: number, offsetAngle: number): void {
        let delatx = Math.cos(curAngle * Math.PI / 180);
        let delaty = Math.sin(curAngle * Math.PI / 180);
        let angle: number = Math.atan2(delatx, delaty) * 180 / Math.PI - 180;
        this.role.transform.localRotationEulerY = angle + offsetAngle;
        var forward: Laya.Vector3 = new Laya.Vector3();
        this.role.transform.getForward(forward)//获取前方向
        Laya.Vector3.normalize(forward, forward);//归一
        Laya.Vector3.scale(forward, curDis, this._forwardlenth);//还原长度

    }

    onEnd(): void {
        this._forwardlenth.setValue(0, 0, 0)
        let rigBody = this.role.getComponent(Laya.RigidBody);
        rigBody && (rigBody.linearVelocity = Laya.Vector3.ZERO);
    }

}