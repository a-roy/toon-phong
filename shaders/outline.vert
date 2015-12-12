#version 330

in vec3 position;
in vec3 normal;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

out vec3 fPosition;

void main()
{
  mat4 MVP = projectionMatrix * viewMatrix * modelMatrix;
  float outline_weight = 0.02;
  vec3 outline = outline_weight * normalize(normal);
  vec4 pos = MVP * vec4(position + outline, 1.0);
  fPosition = pos.xyz;
  float z_Pos = (pos.x > 0.0) ? 0.0 : -2.0;
  gl_Position = vec4(pos.xy, z_Pos, pos.w);
  //gl_Position = pos;
}

