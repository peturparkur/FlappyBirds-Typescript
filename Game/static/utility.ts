import {Vector2, Circle, Rect} from "./my_classes.js"

//draw's circle
function DrawCircle(ctx:CanvasRenderingContext2D, circle:Circle = new Circle(), color:string = "black", outline=false){
    let style = ctx.fillStyle; //save current style
    let stroke_style = ctx.strokeStyle;

    //draw circle
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    ctx.beginPath();
    ctx.arc(circle.position.x, circle.position.y, circle.radius, 0, Math.PI*2);
    if(outline)
        ctx.stroke();
    else
        ctx.fill();

    ctx.closePath();
    ctx.strokeStyle = stroke_style;
    ctx.fillStyle = style; //load back old style
}

function DrawRect(ctx:CanvasRenderingContext2D, rect:Rect = new Rect(), color:string = "black", outline=false){
    ctx.beginPath();
    let style = ctx.fillStyle;
    let stroke_style = ctx.strokeStyle;

    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    if(outline)
        ctx.stroke()
    else
        ctx.fill();

    ctx.closePath();
    ctx.strokeStyle = stroke_style;
    ctx.fillStyle = style;
}

function InsideCircle(circle:Circle, point:Vector2) : boolean{
    let diff = new Vector2(circle.x - point.x, circle.y - point.y); //distance from point -> circle
    let distance = diff.magnitude;
    if(distance <= circle.radius)
        return true;
    //otherwise
    return false;
}

function InsideRect(rect:Rect, point:Vector2) : boolean{
    let diff = new Vector2(point.x - rect.x, point.y-rect.y)
    console.log("diff: ", diff);
    if(Math.abs(diff.x) <= rect.width && Math.abs(diff.y) <= rect.height)
        return true;
    return false;
}

function Intersect(circle : Circle, rect : Rect) {

    //we first want to know the center of the rectangle
    let rect_center = new Vector2(rect.x + rect.width*0.5, rect.y + rect.height*0.5);

    let offset = new Vector2(circle.x - rect_center.x, circle.y - rect_center.y);
    let distance = new Vector2(Math.abs(offset.x), Math.abs(offset.y)); //distance in each direction

    //check if the distance if it's unreachable -> radius + width/2 distance
    if(distance.x > rect.width*0.5 + circle.radius) return false;
    if(distance.y > rect.height*0.5 + circle.radius) return false;


    //if distance from center is less than 0.5*width then it's definite collision
    if(distance.x <= rect.width*0.5) return true;
    if(distance.y <= rect.height*0.5) return true;


    //now have the difficult case when we are hitting an edge but don't reach any corner
    let d = new Vector2(distance.x - rect.width * 0.5, distance.y - rect.height * 0.5);
    if(d.squareMagnitude <= circle.radius*circle.radius) return true;
    return false;
}

export {DrawCircle, DrawRect, InsideCircle, InsideRect, Intersect}