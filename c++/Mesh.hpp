#ifndef SGE_MESH_HPP
#define SGE_MESH_HPP

#include <iostream>
#include <GL/glew.h>
#include <GL/glu.h>
#include <GL/gl.h>
#include <string.h>
#include <vector>

class Mesh
{
private:
	GLuint vbo;
	GLuint nbo;
	GLuint ibo;

	int numVerts;
	int numTris;

	GLfloat* vboData;
	GLfloat* nboData;
	unsigned int* iboData;
public:
	void renderGL();

	void setVBOData(GLfloat* vboData, int numVerts);
	void setNBOData(GLfloat* nboData, int numVerts);
	void setIBOData(unsigned int* iboData, int numTris);
};

#endif
