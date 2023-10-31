import { ITargetMove } from "./interface/ITargetMove";


export class TargetMovePhysic2D implements ITargetMove {


    role: Laya.Sprite
    private _forwardlenth: Laya.Vector2;
    constructor(role: any) {
        this.role = role;
        this._forwardlenth = new Laya.Vector2();
    }



    onBegin(): void {

    }

    onUpdate(){
        let rigBody = this.role.getComponent(Laya.RigidBody);
        rigBody && rigBody.setVelocity({ x: this._forwardlenth.x, y: this._forwardlenth.y })
    }


    onMove(curDis: number, curAngle: number, offsetAngle: number): void {
        this.role.rotation = curAngle + 90 + offsetAngle;
        this._forwardlenth.x = Math.cos(curAngle * Math.PI / 180) * curDis;
        this._forwardlenth.y = Math.sin(curAngle * Math.PI / 180) * curDis;
    }

    onEnd(): void {
        this._forwardlenth.setValue(0,0)
        let rigBody = this.role.getComponent(Laya.RigidBody);
        rigBody && rigBody.setVelocity({ x: 0, y: 0 })
    }

}