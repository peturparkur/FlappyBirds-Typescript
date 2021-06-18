class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    ToString() {
        return this.x + ", " + this.y;
    }
    get squareMagnitude() {
        return this.x * this.x + this.y * this.y;
    }
    get magnitude() {
        return Math.sqrt(this.squareMagnitude);
    }
    //NO OPERATOR OVERLOADING -> BIG SAD
    //Vector Addition
    Add(v) {
        this.x += v.x;
        this.y += v.y;
    }
    Substract(v) {
        this.x -= v.x;
        this.y -= v.y;
    }
}
class Circle {
    constructor(position = new Vector2(), radius = 1) {
        this.position = position;
        this.radius = radius;
    }
    get x() {
        return this.position.x;
    }
    get y() {
        return this.position.y;
    }
}
class Rect {
    constructor(x = 0, y = 0, width = 0, height = 0) {
        //super(x, y, width, height);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    get position() {
        return new Vector2(this.x, this.y);
    }
    set position(pos) {
        this.x = pos.x;
        this.y = pos.y;
    }
}
export { Vector2, Circle, Rect }; //we export the vector2
