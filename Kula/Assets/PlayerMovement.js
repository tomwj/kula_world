﻿#pragma strict

import System.Collections.Generic;

var speed : float = 0.1;
var rotationSpeed : float = 1000.0;
var jumpSpeed : float = 1.0;
var gravity : float;
var floor : GameObject;

var forward : Vector3;
var back : Vector3;
var right : Vector3;
var left : Vector3;
var up : Vector3;
var down : Vector3;

private var moveDirection : Vector3 = Vector3.zero;
private var rolling : boolean = false;

private var rb: Rigidbody;
private var direction = 'down';
private var canRotate = true;
private var rotating = false;



while(true) yield CoUpdate();

function Start () {


}

function CoUpdate() {

  // Set utility direction properties
  forward = transform.forward;
  back = transform.forward * -1;
  right = transform.right;
  left = transform.right * -1;
  up = transform.up;
  down = transform.up * -1;

  var controller : CharacterController = GetComponent.<CharacterController>();

  var jumpVec;

  // if (!controller.isGrounded) print('not grounded!');
  // else print('grounded');

  if (true) {
    if (Input.GetButton ('Jump')) {
      jumpVec = Vector3(0, jumpSpeed, 0);
    }

    if (Input.GetKeyDown(KeyCode.RightArrow))
      yield Rotate(Quaternion.Euler(0, 90, 0));
    else if (Input.GetKeyDown(KeyCode.LeftArrow))
      yield Rotate(Quaternion.Euler(0, -90, 0));
    else if (Input.GetKeyDown(KeyCode.UpArrow) && Input.GetButton('Jump'))
      yield Move(forward * 2 + Vector3(0, 1, 0));
    else if (Input.GetKeyDown(KeyCode.UpArrow))
      yield MoveOrRotate(forward);
    else if (Input.GetKeyDown(KeyCode.DownArrow))
      yield MoveOrRotate(forward * -1);
    else 
      yield;

  }

  // Apply gravity
  if (direction == 'down') {
    moveDirection += Vector3.down * gravity * Time.deltaTime;
    // moveDirection.y -= this.transform.position.y + floor.transform.position.y * Time.deltaTime;
  }

  // print(moveDirection);
  
  // Move the controller
  if (!rotating) {
    // print('moving down');
    controller.Move(moveDirection * Time.deltaTime);
  }

  // print(rotating);

  // var checks = 'edge' + isEdge() + ' rotatable' + isRotatable() + ' isRotatableWall' + isRotatableWall();
  // print(checks);
  // print(transform.position);

}

function isEdge() {
  var dist = 1;
  var rc = Physics.Raycast(transform.position + forward, down, dist);
  return !rc;
}

function isRotatable() {
  // We need to test if there is a block right and left of the ball. 
  // If there isn't, but it's still an edge, we can rotate
  var dist = 1;
  var rc1 = Physics.Raycast(transform.position + right, down, dist);
  var rc2 = Physics.Raycast(transform.position + left, down, dist);
  return !rc1 && !rc2;
}

function isRotatableWall() {
  // We need to test if forward but !left + fwd && !right + fwd. 
  var dist = 1;
  var r = Physics.Raycast(transform.position + right, forward, dist);
  var l = Physics.Raycast(transform.position + left, forward, dist);
  var f = Physics.Raycast(transform.position, forward, dist);
  return f && !r && !l;
}

function OnControllerColliderHit(hit : ControllerColliderHit) {
  // print('hit');
  floor = hit.gameObject;
}

function MoveOrRotate(distance: Vector3) {
  var e = isEdge();
  var r = isRotatable();
  var rw = isRotatableWall();

  if (rotating) return;

  print('not rotating, moving');

  if (e && r && !rw) {
    rotating = true;
    yield Move(forward);
    yield Move(down);
    yield RotateWorld(left, this.transform.position);
  } else if (rw) {
    rotating = true;
    // Rotate backwards if wall, ie. round right axis
    yield RotateWorld(right, this.transform.position);
  } else if (!e) {
    yield Move(distance);
  }
}

function Move(distance : Vector3) {
  var pt = this.transform;
  var goal = pt.position + distance;
  print ('moving');
  while (pt.position != goal) {
    pt.position = Vector3.MoveTowards(pt.position, goal, speed * Time.deltaTime);
    yield;
  }
  print('moved');
}

function Rotate(rotation : Quaternion) {
  var pt = this.transform;
  var goal = pt.rotation * rotation;
  while (pt.rotation != goal) {
    pt.rotation = Quaternion.RotateTowards(pt.rotation, goal, 10);
    yield;
  }
}

function RotateCube(cube : GameObject, axis: Vector3, point: Vector3, last: boolean) {
  // see: http://answers.unity3d.com/questions/29110/easing-a-rotation-of-rotate-around.html

  var rotateAmount : int = 90;
  var rotateTime : int = 1;
  var step : float = 0.0; // non-smoothed
  var rate : float = 1.0/rotateTime; // amount to increase non-smooth step by
  var smoothStep : float = 0.0; // smooth step this time
  var lastStep : float = 0.0; // smooth step last time

  var goal = Quaternion.Euler(axis * rotateAmount) * cube.transform.rotation;
  while (cube.transform.rotation != goal) {
    step += Time.deltaTime * rate; // increase the step
    smoothStep = Mathf.SmoothStep(0.0, 1.0, step); // get the smooth step
    cube.transform.RotateAround(point, axis, rotateAmount * (smoothStep - lastStep));
    lastStep = smoothStep; // store the smooth step
    yield;
  }

  // finish any left over
  if (step > 1.0) 
    transform.RotateAround(point, axis, rotateAmount * (1.0 - lastStep));

  print(last);
  // check for last coroutine to have finished
  if (last) {
    print('turning off rotating');
    rotating = false;
  }
}

function RotateWorld(axis : Vector3, point : Vector3) {
  print('rotating world');
  var cubes = GameObject.FindGameObjectsWithTag('Rotates');
  for (var i : int = 0; i < cubes.Length; i++) {
    var last = i == cubes.Length - 1;
    RotateCube(cubes[i], axis, point, last);
  }
  while (rotating) yield;
  print('yielding rotate');
}

function Update () {
  
}