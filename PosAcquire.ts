/**
* @brief: 随机点获取逻辑
* @ author: gongganghao
* @ data: 2023-09-19 19:28
*/

import { PosAcquireType } from "./data/PosAcquireData";
import { IPosAcquire } from "./interface/IPosAcquire";



const { regClass, property,runInEditor} = Laya;

@regClass() 
export class PosAcquire extends Laya.Component implements IPosAcquire {


    @property({ type: PosAcquireType, tips: "位置类型", options: { "点类型": PosAcquireType.point, "面类型": PosAcquireType.plane, "体类型": PosAcquireType.body } })
    public acquireType: PosAcquireType = PosAcquireType.point;
    @property({ type: Number, hidden: "data.acquireType == 1", tips: "半径" })
    public acquireRadius: number = 0;

    private _target: any;

    constructor(){
        super();
        this._singleton = true;
    }


    onAwake(): void {
        this._target = this.owner;
    }

    onEnable(): void {
        // 测试逻辑
        // Laya.timer.loop(1000, this, this.test)
    }


    getPosition(): Laya.Vector3 | Laya.Vector2 {
        if (this._target instanceof Laya.Sprite) {
            let pos = new Laya.Vector2(this._target.x, this._target.y);
            if (this.acquireType != PosAcquireType.point) {
                let ranRadin = Math.random() * 2 * Math.PI
                let ranRadius = this.acquireRadius * Math.random();
                pos.x += Math.cos(ranRadin) * ranRadius;
                pos.y += Math.sin(ranRadin) * ranRadius;
            }
            return pos;
        } else {
            switch (this.acquireType) {
                case PosAcquireType.point:
                    return this._target.transform.position.clone();
                case PosAcquireType.plane:
                    return this.getPlanePosition();
                case PosAcquireType.body:
                    return this.getBodyPosition();

            }

        }
    }

    getPlanePosition(): Laya.Vector3 {
        let pos = this._target.transform.position.clone();
        let ranRadin = Math.random() * 2 * Math.PI
        let ranRadius = this.acquireRadius * Math.random();
        let up = new Laya.Vector3();
        (this._target as Laya.Sprite3D).transform.getUp(up);
        let offset = new Laya.Vector3(Math.cos(ranRadin),0,Math.sin(ranRadin))
        //通过点法线方程计算z的位置(nx*(x - x0) + ny*(y - y0) + nz*(z - z0) = 0)；
        up.y!=0 && (offset.y -= (up.x * offset.x + up.z * offset.z) / up.y);
        offset = offset.normalize();
        Laya.Vector3.scale(offset,ranRadius,offset)
        let ans = new Laya.Vector3();
        Laya.Vector3.add(pos, offset, ans)
        return ans;
    }

    getBodyPosition(): Laya.Vector3 {
        let pos = this._target.transform.position.clone();
        let ranRadin1 = Math.random() * 2 * Math.PI
        let ranRadin2 = Math.random() * 2 * Math.PI
        let ranRadius =  this.acquireRadius * Math.random();
        pos.x += ranRadius * Math.sin(ranRadin1) * Math.cos(ranRadin2);
        pos.y += ranRadius * Math.sin(ranRadin1) * Math.sin(ranRadin2);
        pos.z += ranRadius * Math.cos(ranRadin1);
        return pos;
    }

    //#region 测试代码
    test() {
        let pos = this.getPosition();
        let parent = this._target.parent;
        if (this._target instanceof Laya.Sprite) {
            let sprite = new Laya.Sprite();
            sprite.graphics.drawCircle(pos.x, pos.y, 10, "#FF0000");
            parent.addChild(sprite);
        } else {
            //创建Box网络
            let boxMesh: Laya.Mesh = Laya.PrimitiveMesh.createSphere(1);
            //创建MeshSprite3D网络
            let boxMeshSprite3D: Laya.MeshSprite3D = new Laya.MeshSprite3D(boxMesh);
            //添加到场景中
            let sprite = parent.addChild(boxMeshSprite3D);
            sprite.transform.position = pos as Laya.Vector3
        }
    }
    //#endregion

}