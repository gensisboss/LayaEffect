/**
 * 笔触形状
 */
export enum BruhshworkShap {
    /**正方形 */
    square,
    /**圆形 */
    circle,
    /**八边形 */
    octagon,
}

/**
 * 像素记录
 */
export class PixelRecord {
    /**像素坐标 */
    m_pos: Laya.Vector2;

    /**argb颜色值 */
    m_color: Laya.Color;

    /**浮点颜色值 */
    m_ColorValue: number[];

    /**构造函数 */
    constructor(_pos: Laya.Vector2, _colorValue: number[]) {
        this.m_pos = _pos;
        this.m_ColorValue = _colorValue;
    }

    /**
     * 位置是否一致
     * @param _pos 
     * @returns 
     */
    SamePos(_pos: Laya.Vector2): boolean {
        let res: boolean = false;
        if (_pos.x == this.m_pos.x &&
            _pos.y == this.m_pos.y) {
            res = true;
        }
        return res;
    }
}

/**
 * 绘制步骤
 */
export class DrawingStep {
    /**笔触形状 */
    m_BrushworkShape: BruhshworkShap = BruhshworkShap.square;

    /**笔触大小,长宽 */
    m_BrushSize: number = 2;

    /**笔触颜色 */
    m_BrushColorValue: number[] = [255, 255, 255, 255];

    /**绘制前的像素点信息 */
    m_BeforeBuffer: PixelRecord[] = [];


    /**
     * 构造函数
     */
    constructor(_shape: BruhshworkShap, _size: number, _colorV: number[]) {
        this.m_BrushworkShape = _shape;
        this.m_BrushSize = _size;
        this.m_BrushColorValue = _colorV;
    }

    AddAll(_texture: Laya.Texture2D) {
        let _poses: Laya.Vector2[] = [];
        for (let i = 0; i < _texture.width; i++) {
            for (let j = 0; j < _texture.height; j++) {
                _poses.push(new Laya.Vector2(i, j))
            }
        }
        this.MergePoses(_poses, _texture);
        this.PaintPixels(_poses, _texture);
    }

    /**
     * 
     */
    AddStart(_startpos: Laya.Vector2, _texture: Laya.Texture2D) {
        let _poses: Laya.Vector2[] = DrawingBoard.S_GetPixelsArround(_startpos, this.m_BrushworkShape, this.m_BrushSize);
        this.MergePoses(_poses, _texture);
        this.PaintPixels(_poses, _texture);
    }

    /**
     * 
     * @param _endpos 
     * @param _texture 
     */
    AddEnd(_endpos: Laya.Vector2, _texture: Laya.Texture2D) {
        let _poses: Laya.Vector2[] = DrawingBoard.S_GetPixelsArround(_endpos, this.m_BrushworkShape, this.m_BrushSize);
        this.MergePoses(_poses, _texture);
        this.PaintPixels(_poses, _texture);
    }

    /**
     * 添加线段
     * @param _seg 线段
     * @param _poses 覆盖像素列表
     */
    AddSeg(_seg: DrawingSeg, _poses: Laya.Vector2[], _texture: Laya.Texture2D) {
        this.MergePoses(_poses, _texture);
        this.PaintPixels(_poses, _texture);
    }

    /**
     * 合并像素列表
     * @param _poses 
     */
    MergePoses(_poses: Laya.Vector2[], _texture: Laya.Texture2D) {
        for (let i: number = 0; i < _poses.length; i++) {
            let _pos: Laya.Vector2 = _poses[i];
            let _c: number[] = DrawingBoard.S_GetPixelValueFromTexture(_texture, _pos)
            let _record: PixelRecord = new PixelRecord(_pos, _c);
            this.m_BeforeBuffer.push(_record);
        }
    }

    /**
     * 指定位置像素是否已经保存过
     * @param _pos 
     * @returns 
     */
    Include(_pos: Laya.Vector2): boolean {
        let res: boolean = false;
        for (let i: number = 0; i < this.m_BeforeBuffer.length; i++) {
            if (this.m_BeforeBuffer[i].SamePos(_pos)) {
                res = true;
                return res;
            }
        }
        return res;
    }


    /**
     * 将指定像素集合中的像素均绘制成设置颜色
     * @param _poses 
     * @param _texture 
     */
    PaintPixels(_poses: Laya.Vector2[], _texture: Laya.Texture2D) {
        let _array = (_texture as any)._pixels;//Laya.Camera.getTexturePixel(_texture);
        for (let i: number = 0; i < _poses.length; i++) {
            this.PaintOnePixel(_poses[i], _texture, this.m_BrushColorValue, _array);
        }
        this.setSubPixelsData(_texture, _array);
    }

    /**
     * 重绘 
     * @param _texture 
     */
    RePaint(_texture: Laya.Texture2D) {
        let _array = (_texture as any)._pixels;//Laya.Camera.getTexturePixel(_texture);
        for (let i: number = 0; i < this.m_BeforeBuffer.length; i++) {
            this.PaintOnePixel(this.m_BeforeBuffer[i].m_pos, _texture, this.m_BrushColorValue, _array);
        }
        this.setSubPixelsData(_texture, _array);
    }

    setSubPixelsData(_texture: Laya.Texture2D, _array) {
        _texture.setSubPixelsData(0, 0, _texture.width, _texture.height, _array, 0, false, false, false);
        (_texture as any)._pixels = _array;
    }


    /**
     * 撤销，恢复到步骤开始前的像素
     * @param _texture 
     */
    Undo(_texture: Laya.Texture2D) {

        let _array = (_texture as any)._pixels;//Laya.Camera.getTexturePixel(_texture);
        for (let i: number = this.m_BeforeBuffer.length - 1; i >= 0; i--) {
            this.PaintOnePixel(this.m_BeforeBuffer[i].m_pos, _texture, this.m_BeforeBuffer[i].m_ColorValue, _array);
        }
        this.setSubPixelsData(_texture, _array);
    }



    /**
     * 绘制一个像素
     * @param _pos 像素位置
     * @param _texture 指定贴图
     * @param _colorV 颜色值
     * @param _pixelArray 贴图的像素列表
     */
    PaintOnePixel(_pos: Laya.Vector2, _texture: Laya.Texture2D, _colorV: number[], _pixelArray: any) {
        if (!this.ValidatePos(_pos, _texture)) {
            console.log("InValidate pos  x:" + _pos.x + ",y:" + _pos.y);
            return;
        }
        let _index: number = (_pos.y * _texture.width + _pos.x) * 4;
        for (let i = 0; i < 4; i++) {
            _pixelArray[_index + i] = _colorV[i];
        }
    }

    /**
     * 指定位置是否再贴图的有效范围内
     * @param _pos 位置
     * @param _texture 贴图
     * @returns 
     */
    ValidatePos(_pos: Laya.Vector2, _texture: Laya.Texture2D): boolean {
        let res: boolean = false;
        if (!_texture) return res;
        if (_pos.x >= 0 && _pos.x < _texture.width &&
            _pos.y >= 0 && _pos.y < _texture.height) {
            res = true;
        }
        return res;
    }
}

/**
 * 绘制片段
 */
export class DrawingSeg {
    /**起点 */
    m_StartPos: Laya.Vector2;
    /**中点 */
    m_endPos: Laya.Vector2;

    /**
     * 构造函数
     * @param _start 起点
     * @param _end 终点
     */
    constructor(_start: Laya.Vector2, _end: Laya.Vector2) {
        this.m_StartPos = _start;
        this.m_endPos = _end;
    }
}


/**
 * 画板类
 */
export class DrawingBoard {
    /**笔触形状 */
    m_BrushworkShape: BruhshworkShap = BruhshworkShap.square;

    /**笔触大小,长宽 */
    m_BrushSize: number = 64;

    /**笔触颜色(浮点值) 白色 */
    m_BrushColorValue: number[] = [255, 255, 255, 255];

    /**绘制目标贴图 */
    m_Texture: Laya.Texture2D;

    /**步骤列表 */
    m_DrawingSteps: DrawingStep[] = [];

    /**回收步骤列表（用于redo）*/
    m_RecycleSteps: DrawingStep[] = [];

    /**当前步骤ID */
    m_CurrentStepIndex: number = 0;
    /**当前操作步骤 */
    m_CurrentStep: DrawingStep;

    /**当前画板 */
    m_DrawBoard: Laya.Image;


    /**
     * 构造函数
     */
    constructor(board: Laya.Image) {
        this.m_DrawBoard = board;
    }

    //#region Operation 操作接口
    /**
     * 在贴图上绘制线段
     * @param _startPos 起始点
     * @param _endPos 终止点
     */
    public DrawSeg(_startPos: Laya.Vector2, _endPos: Laya.Vector2) {
        let _SegPixels: Laya.Vector2[] = this.GetSegPixels(_startPos, _endPos);
        if (this.m_CurrentStep) {
            this.m_CurrentStep.AddSeg(new DrawingSeg(_startPos, _endPos), _SegPixels, this.m_Texture);
        }
        this.m_DrawBoard.repaint();
    }

    /**
     * 绘制底板颜色
     * @param _color 颜色值
     */
    public DrawBoard() {
        let _newStep: DrawingStep = new DrawingStep(this.m_BrushworkShape, this.m_BrushSize, this.m_BrushColorValue);
        this.m_DrawingSteps.push(_newStep);
        _newStep.AddAll(this.m_Texture)
        this.m_CurrentStepIndex++;
        this.m_DrawBoard.repaint();
        if (this.m_RecycleSteps) {
            this.m_RecycleSteps.splice(0, this.m_RecycleSteps.length);
        }
    }

    /**
     * 开始新的绘制步骤
     * @param _pos 点击位置
     */
    public StartNewStep(_pos: Laya.Vector2) {
        let _newStep: DrawingStep = new DrawingStep(this.m_BrushworkShape, this.m_BrushSize, this.m_BrushColorValue);
        this.m_DrawingSteps.push(_newStep);
        this.m_CurrentStep = _newStep;
        this.m_CurrentStep.AddStart(_pos, this.m_Texture);

        this.m_CurrentStepIndex++;

        if (this.m_RecycleSteps) {
            this.m_RecycleSteps.splice(0, this.m_RecycleSteps.length);
        }
        this.m_DrawBoard.repaint();
    }

    /**
     * 完成当前的绘制步骤
     */
    public StepOver(_pos: Laya.Vector2) {
        if (this.m_CurrentStep) {
            this.m_CurrentStep.AddEnd(_pos, this.m_Texture);
            this.m_CurrentStep = null;
        }
        this.m_DrawBoard.repaint();

    }

    /**
     * 检测能否撤销
     */
    public CanUndo() {
        return this.m_DrawingSteps.length > 0;
    }

    /**
     * 撤销ctrl+z
     */
    public Undo() {
        let _lastStep: DrawingStep = this.m_DrawingSteps.pop();
        if (_lastStep) {
            this.m_RecycleSteps.push(_lastStep);
            this.m_CurrentStepIndex--;
            _lastStep.Undo(this.m_Texture);
            this.m_DrawBoard.repaint();
        }
    }

    /**
    * 检测能否恢复
    */
    public CanRedo() {
        return this.m_RecycleSteps.length > 0;
    }


    /**
     * 恢复ctrl+y(重绘)
     */
    public Redo() {
        let _step: DrawingStep = this.m_RecycleSteps.pop();
        if (_step) {
            this.m_DrawingSteps.push(_step);
            this.m_CurrentStepIndex++;
            _step.RePaint(this.m_Texture);
            this.m_DrawBoard.repaint();
        }
    }

    /**
     * 清空所有步骤
     */
    public ClearSteps() {
        this.m_CurrentStepIndex = 0;
        if (this.m_DrawingSteps) {
            this.m_DrawingSteps.splice(0, this.m_DrawingSteps.length);
        }
        if (this.m_RecycleSteps) {
            this.m_RecycleSteps.splice(0, this.m_RecycleSteps.length);
        }
        let _pixels: Uint8Array = new Uint8Array(this.m_Texture.width * this.m_Texture.height * 4);

        this.m_Texture.setSubPixelsData(0, 0, this.m_Texture.width, this.m_Texture.height, _pixels, 0, false, false, false);
        (this.m_Texture as any)._pixels = _pixels;
    }
    //#endregion

    //#region  setting 设置接口
    /**
     * 设置笔触形状
     * @param _shape 
     */
    public SetBrushShap(_shape: BruhshworkShap) {
        this.m_BrushworkShape = _shape;
    }

    /**
     * 设置笔触大小
     * @param _size 
     */
    public SetBrushSize(_size: number) {
        this.m_BrushSize = _size;
    }

    /**
     * 设置笔触颜色
     * @param _color rgb值
     */
    public SetBrushColor(_color: Laya.Color) {
        this.m_BrushColorValue = DrawingBoard.S_GetValueByColor(_color);
    }


    /**
     * 设置目标贴图
     * @param _texture 
     */
    public SetTextTure(_texture: Laya.Texture2D) {
        if (_texture) {
            this.m_Texture = _texture;
        }
    }

    //#endregion

    /**
     * 按当前笔触获取线段覆盖的像素点集合
     * @param _startPos 
     * @param _endPos 
     */
    public GetSegPixels(_startPos: Laya.Vector2, _endPos: Laya.Vector2): Laya.Vector2[] {
        let res: Laya.Vector2[] = [];
        let _line: Laya.Vector2[] = DrawingBoard.S_GetLinePixels(_startPos, _endPos);
        res = this.GetPixelAroundLine(_line, _startPos, _endPos, this.m_BrushworkShape, this.m_BrushSize);
        return res;
    }





    /**
     * 
     * @param _linePixels 
     * @param _startPos 
     * @param _endPos 
     */
    public  GetPixelAroundLine(_linePixels: Laya.Vector2[], _startPos: Laya.Vector2, _endPos: Laya.Vector2, _shape: BruhshworkShap, _size: number): Laya.Vector2[] {
        let res: Laya.Vector2[] = [];
        for (let i = 0; i < _linePixels.length; i++) {
            let tempRes = DrawingBoard.S_GetPixelsArround(_linePixels[i], _shape, _size);
            res = res.concat(tempRes);
        }
        return res;
    }



    /**
     * 获取两点连线上的像素列表
     * @param _startPos 起点坐标
     * @param _endPos 终点坐标
     * @returns 像素列表
     */
    static S_GetLinePixels(_startPos: Laya.Vector2, _endPos: Laya.Vector2,step:number=0.1): Laya.Vector2[] {
        let res: Laya.Vector2[] = [];
        for (let i = 0; i < 1; i += step) {
            let x = Math.round(_startPos.x * (1 - i) + _endPos.x * (i));
            let y = Math.round(_startPos.y * (1 - i) + _endPos.y * (i));
            res.push(new Laya.Vector2(x, y));
        }
        return res;
    }

    /**
     * 根据笔触获取指定中心位置四周的像素列表
     * @param _poses 中心点位置
     * @param _shape 笔触形状
     * @param _size  笔触大小
     */
    public static S_GetPixelsArround(_poses: Laya.Vector2, _shape: BruhshworkShap, _size: number): Laya.Vector2[] {
        switch (_shape) {
            case BruhshworkShap.square:
                return DrawingBoard.S_GetSquare(_poses, _size);
            case BruhshworkShap.circle:
                return DrawingBoard.S_GetCircle(_poses, _size);
            case BruhshworkShap.octagon:
                return DrawingBoard.S_GetOctagon(_poses, _size);
        }
    }

    /**
     * 正方形笔触获取覆盖范围像素列表
     * @param _center 中心点位置
     * @param _width 正方形边长
     * @returns 
     */
    static S_GetSquare(_center: Laya.Vector2, _width: number): Laya.Vector2[] {
        let res: Laya.Vector2[] = [];
        for (let x: number = 0; x < _width; x++) {
            for (let y: number = 0; y < _width; y++) {
                let _x: number = _center.x + x - _width / 2;
                let _y: number = _center.y + y - _width / 2;
                if (_x >= 0 && _y >= 0) {
                    let _v: Laya.Vector2 = new Laya.Vector2(_x, _y);
                    res.push(_v);
                }
            }
        }
        return res;
    }

    /**
     * 圆形笔触获取覆盖范围像素列表
     * @param _center 中心点位置
     * @param _radius 圆形半径
     * @returns 
     */
    static S_GetCircle(_center: Laya.Vector2, _radius: number): Laya.Vector2[] {
        let res: Laya.Vector2[] = [];
        for (let j = 1; j < _radius; j++) {
            for (let i = 0; i <= 360; i+=5) {
                let _x: number = Math.round(_center.x + j * Math.cos(i*Math.PI/180));
                let _y: number = Math.round(_center.y + j * Math.sin(i*Math.PI/180));
                if (_x >= 0 && _y >= 0) {
                    let _v: Laya.Vector2 = new Laya.Vector2(_x, _y);
                    res.push(_v);
                }
            }
        }
        return res;
    }

    /**
     * 八边形笔触获取覆盖范围像素列表
     * @param _center 中心点位置
     * @param _radius 八边形半径
     * @returns 
     */
    static S_GetOctagon(_center: Laya.Vector2, _radius: number): Laya.Vector2[] {
        let res: Laya.Vector2[] = [];
        //先获取一个三角形内的点，然后将所有的点旋转八次
        let point1 = new Laya.Vector2(Math.round(Math.cos(22.5*Math.PI/180)*_radius),Math.round(Math.sin(22.5*Math.PI/180)*_radius));
        let point2 = new Laya.Vector2(Math.round(Math.cos(22.5*Math.PI/180)*_radius),-Math.round(Math.sin(22.5*Math.PI/180)*_radius));
        let tempRes: Laya.Vector2[] = [];
        let _linePoints = DrawingBoard.S_GetLinePixels(point1,point2);
        for (let i = 0; i < _linePoints.length; i++) {
            let points = DrawingBoard.S_GetLinePixels(Laya.Vector2.ZERO,_linePoints[i]);
            tempRes = tempRes.concat(points);
        } 
        //开始旋转八次
        for (let i = 0; i <= 360; i+=45) {
           let temp: Laya.Vector2[] = [];
           for (let j = 0; j < tempRes.length; j++) {
                let point = new Laya.Vector2(
                Math.round(tempRes[j].x * Math.cos(i*Math.PI/180) - tempRes[j].y*Math.sin(i*Math.PI/180)+_center.x),
                Math.round(tempRes[j].x * Math.sin(i*Math.PI/180) + tempRes[j].y*Math.cos(i*Math.PI/180))+_center.y);
                temp.push(point);
           }
           res = res.concat(temp);  
        }
        return res;
    }

    /**
     * 从指定贴图获取像素值
     * @param _texture 贴图
     * @param _pos 像素位置
     * @returns 像素值
     */
    static S_GetPixelValueFromTexture(_texture: Laya.Texture2D, _pos: Laya.Vector2): number[] {
        let res: number[] = [0, 0, 0, 0];
        if (!_texture) return res;
        const _pixels = (_texture as any)._pixels//Laya.Camera.getTexturePixel(_texture) as any;
        let _index: number = (_pos.y * _texture.width + _pos.x) * 4;

        for (let i = 0; i < 4; i++) {
            let _id: number = _index + i;
            if (_pixels && _id >= 0 && _id < _pixels.length) {
                res[i] = _pixels[_id];
            }
        }
        return res;
    }

    /**
     * 从指定贴图获取像素颜色
     * @param _texture  贴图
     * @param _pos 像素位置
     * @returns 像素颜色
     */
    static S_GetPixelColorFromTexture(_texture: Laya.Texture2D, _pos: Laya.Vector2): Laya.Color {
        let res: Laya.Color = Laya.Color.BLACK;
        let _value: number[] = DrawingBoard.S_GetPixelValueFromTexture(_texture, _pos);
        res = DrawingBoard.S_GetColorByValue(_value);
        return res;
    }

    /**
     * 根据浮点取值获取rgb颜色值
     * @param _value 浮点值
     * @returns rgb颜色值
     */
    static S_GetColorByValue(_value: number[]): Laya.Color {
        let res: Laya.Color = Laya.Color.BLACK;
        //TODO
        return res;
    }

    /**
     * 根据rgb颜色值获取浮点取值
     * @param _color rgb颜色值
     * @returns 浮点值
     */
    static S_GetValueByColor(_color: Laya.Color): number[] {
        return [_color.r * 255, _color.g * 255, _color.b * 255, _color.a * 255];
    }

}