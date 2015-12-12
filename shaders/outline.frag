#version 330

in vec3 fPosition;

void main()
{
  if (fPosition.x > 0.0)
    gl_FragColor = vec4(0, 0, 0, 1);
  else
    gl_FragColor = vec4(0, 0, 0, 0);
}
