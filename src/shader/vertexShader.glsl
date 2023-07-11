attribute float height;
uniform float uHeightCoefficient;
uniform vec2 uMouse;

varying float vHeight;
varying float vRatio;

void main(){
    vec3 heightVector=normal*height*uHeightCoefficient;
    vec3 extendedPosition=position+heightVector;
    vec4 worldPosition=modelMatrix*vec4(extendedPosition,1.);
    vec4 mvPosition=viewMatrix*worldPosition;
    gl_Position=projectionMatrix*mvPosition;
    
    vHeight=height;
    vRatio=uMouse.y*2.0;
}