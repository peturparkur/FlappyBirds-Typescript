import { throws } from "assert/strict";
import { Circle, Vector2, Rect } from "./my_classes.js";
import { Intersect } from "./utility.js";

//might want to make an abstract gameobject class
class Bird {
    active : boolean;
    circle : Circle;
    velocity : Vector2; //y -> up, x -> right
    color : string; //visualisation, could be in abstract

    constructor(x : number = 0, y:number = 0, radius : number = 1, color : string = null, active : boolean = true){
        this.circle = new Circle(new Vector2(x, y), radius);
        this.color = color
        this.velocity = new Vector2();
        this.active = active;
    }

    get position(){
        return this.circle.position;
    }
    get radius(){
        return this.circle.radius;
    }
}

class Obstacle {
    rect : Rect;

    constructor(x : number = 0, y : number = 0, width : number = 0, height : number = 0){
        this.rect = new Rect(x, y, width, height);
    }

    get position(){
        return new Vector2(this.rect.x, this.rect.y);
    }

    set position(pos : Vector2){
        this.rect.position = pos;
    }

    get width(){
        return this.rect.width;
    }

    get height(){
        return this.rect.height;
    }
}

class Game{
    active : boolean;
    width : number;
    height : number;
    numPlayers : number;
    gravity : number;
    timestep : number;
    forwardSpeed : number;
    jumpFactor : number;

    birds : Array<Bird>; //to control the birds
    //active : Array<boolean>; //wether the bird is active or not
    obstacles : Array<Obstacle>; //this will represent the pipes

    step : number;

    winner : number; //winner index


    constructor(width:number = 800, height:number = 500, numPlayers : number = 1, gravity : number = 9.81, timestep : number = 0.2, fwSpeed : number = 1, jumpFactor : number = 4){
        this.active = true;
        this.step = 0;
        this.width = width;
        this.height = height;

        this.numPlayers = numPlayers;
        this.gravity = gravity;
        this.timestep = timestep;
        this.forwardSpeed = fwSpeed;

        this.jumpFactor = jumpFactor;

        this.birds = new Array<Bird>(numPlayers); //create this many birds
        //this.active = new Array<boolean>(this.birds.length);
        for(let i=0; i<this.birds.length; i++){
            //start birds in center height but left side
            this.birds[i] = new Bird(this.width * 0.05, this.height*0.5, 25); //position and radius
            //this.active[i] = true; //by default all birds are active
        }

        this.obstacles = new Array<Obstacle>(0);

        this.winner = -1;
    }

    //when action is done by bird aka => button pressed to "jump"
    Action(index : number){
        if(!this.active) return; //if the game is inactive
        if(!this.birds[index].active) return; //if not active ignore
        this.birds[index].velocity.y = -this.jumpFactor*this.gravity; //set the up velocity to value
    }

    Winner(){
        let count = 0;
        let winner = -2;
        for(let i=0; i<this.birds.length; i++){
            if(this.birds[i].active){
                winner = i;
                count += 1
            };
            if(count > 1) return -2; //no winner yet
        }
        if(count === 0) return -1; //draw
        return winner;
    }

    Step(dt : number = this.timestep) {
        if(!this.active) return;

        this.step += 1;
        //integrate the accelaration
        for(let i=0; i<this.birds.length; i++){
            if(!this.birds[i].active) continue; //don't do anything
            this.birds[i].velocity.y += 0.5*this.gravity*dt; //might want to make this conditional

            if(this.birds[i].velocity.y > 50) this.birds[i].velocity.y = 50;
        }

        //integrate velocity
        for(let i=0; i<this.birds.length; i++){
            if(!this.birds[i].active) continue; //don't do anything
            this.birds[i].position.y += this.birds[i].velocity.y * dt; //might want to make this conditional
        }


        //console.log("move speed: ", this.forwardSpeed*dt);
        for(let i=0; i<this.obstacles.length; i++){
            this.obstacles[i].rect.x -= this.forwardSpeed*dt; //want them to move left
        }

        //evaluating collision
        this.CheckValid();


        //Checking if birds hit the bottom of the ground
        for(let i=0; i<this.birds.length; i++){
            if(this.birds[i].position.y > this.height || this.birds[i].position.y < -this.birds[i].radius*2){
                this.birds[i].active = false;
            }
        }

        //generate new obstacle
        if(this.obstacles.length <= 0)
        {
            this.GenerateObstacle(50, 150);
        }
        else
        {
            //if the very first element is behind a point generate new obstacle
            if(this.obstacles[0].position.x < -this.obstacles[0].width)
                this.GenerateObstacle(50, 150);
        }


        //Now we want to remove obstacles when they're out of the screen
        //the obstacles are ordered in terms of distance to bird
        if(this.obstacles.length <= 0) return;
        if(this.obstacles[0].position.x < -this.obstacles[0].width) this.obstacles.shift();

        //End case for the game
        //this.active = !this.GameOver();
        this.winner = this.Winner();
        if(this.winner >= -1){
            this.active = false;
        }
    }

    GameOver(){
        let count = 0
        for(let i=0; i<this.birds.length; i++){
            if(this.birds[i].active) count += 1;
            if(count > 1) return false; //we have atleast 2 active players
        }
        return true;
    }

    //a bird is valid if it's on the obstacle
    CheckValid(){
        for(let i=0; i<this.obstacles.length; i++){
            for(let j=0; j<this.birds.length; j++){
                
                //ofset is measured from obstacle top left corner
                let offset = new Vector2(this.birds[j].position.x - this.obstacles[i].position.x,
                                        this.birds[j].position.y - this.obstacles[i].position.y);
                
                console.log("offset: ", offset);
                //check if within range of obstacle
                if(offset.x > 0 && offset.x < this.obstacles[i].width){
                    console.log("within X range");
                    //now we need to check if the y range is valid
                    //then we are in valid bounds
                    if(offset.y > this.birds[j].radius && offset.y < this.obstacles[i].height - this.birds[j].radius){

                    }
                    else{
                        this.birds[j].active = false; //de-active bird because not at right bit
                    }
                }
            }
        }
    }

    CheckCollision(){
        //we check if any of the birds overlap
        //first bruteforce check every obstacle with every bird, few enough stuff that it shouldn't matter
        for(let i=0; i<this.obstacles.length; i++){
            for(let j=0; j<this.birds.length; j++){
                let overlap = Intersect(this.birds[j].circle, this.obstacles[i].rect);
                if(overlap){
                    //bird[j] is dead
                    this.birds[j].active = false;
                }
            }
        }
    }

    Reset(){
        for(let i=0; i<this.birds.length; i++){
            //start birds in center height but left side
            this.birds[i] = new Bird(this.width * 0.05, this.height*0.5, 25); //position and radius
            //this.active[i] = true; //by default all birds are active
        }
        this.obstacles = new Array<Obstacle>(0);
    }

    GenerateObstacle(width : number = 20, height : number = 50){
        //want to decide the y offset only with fixed width and height
        //want to put it to just outside the screen
        let y = Math.random() * (this.height - height); //minimum -> 0, max -> screen_height - height
        let obstacle = new Obstacle(this.width, y, width, height);

        this.obstacles.push(obstacle); //add the obstacle to the array
    }
}

export{ Bird, Obstacle, Game}