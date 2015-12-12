in vec3 position;
in vec3 normal;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

varying vec3 fNormal;
varying vec3 fPosition;
varying vec4 sPosition;

void main()
{
  mat4 MVP = projectionMatrix * viewMatrix * modelMatrix;
  vec4 pos = MVP * vec4(position, 1.0);
  fNormal = normal.xyz;
  fPosition = pos.xyz;
  
  sPosition = MVP * vec4(position, 1);
  gl_Position = sPosition;
}
