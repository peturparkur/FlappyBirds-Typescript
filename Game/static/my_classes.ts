class Vector2{
    x: number;
    y: number;

    constructor(x:number=0, y:number=0){
        this.x = x;
        this.y = y;
    }

    ToString(){
        return this.x + ", " + this.y;
    }

    get squareMagnitude(){
        return this.x*this.x + this.y*this.y;
    }

    get magnitude(){
        return Math.sqrt(this.squareMagnitude);
    }

    //NO OPERATOR OVERLOADING -> BIG SAD
    //Vector Addition
    Add(v:Vector2){
        this.x += v.x;
        this.y += v.y;
    }

    Substract(v:Vector2){
        this.x -= v.x;
        this.y -= v.y;
    }
}

class Circle{
    radius: number;
    position: Vector2;

    constructor(position:Vector2 = new Vector2(), radius:number = 1){
        this.position = position;
        this.radius = radius;
    }

    get x(){
        return this.position.x;
    }

    get y(){
        return this.position.y;
    }
}


class Rect{
    x : number;
    y : number;
    width : number;
    height: number;

    constructor(x : number = 0, y : number = 0, width : number = 0, height : number = 0){
        //super(x, y, width, height);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

    }
    get position(){
        return new Vector2(this.x, this.y);
    }

    set position(pos : Vector2){
        this.x = pos.x;
        this.y = pos.y;
    }
}

export {Vector2, Circle, Rect} //we export the vector2