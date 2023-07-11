uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;
uniform float uMaxHeight;

varying float vHeight;

void main(){
    vec3 color=mix(uDepthColor,uSurfaceColor,vHeight/uMaxHeight);
    gl_FragColor=vec4(color,1.);
}