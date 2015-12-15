#include "Mesh.hpp"

void Mesh::renderGL()
{

	/* Send VBO to GPU */
	glEnableVertexAttribArray(0);
	glBindBuffer(GL_ARRAY_BUFFER, vbo);
	glVertexAttribPointer(
		0,
		3,
		GL_FLOAT,
		GL_FALSE,
		0,
		(void*)0
	);

	/* Send NBO to GPU */
	glEnableVertexAttribArray(1);
	glBindBuffer(GL_ARRAY_BUFFER, nbo);
	glVertexAttribPointer(
		1,
		3,
		GL_FLOAT,
		GL_FALSE,
		0,
		(void*)0
	);

	/* Send IBO to GPU */
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ibo);

	/* Draw indexed VBO and NBO */
	glDrawElements(
		GL_TRIANGLES,
		numTris * 3,
		GL_UNSIGNED_INT,
		(void*)0
	);

	/* Clean up */
	glDisableVertexAttribArray(0);
	glDisableVertexAttribArray(1);
	glBindBuffer(GL_ARRAY_BUFFER, 0);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
}

void Mesh::setVBOData(GLfloat* vboData, int numVerts)
{
	GLuint VertexArrayID;
	glGenVertexArrays(1, &VertexArrayID);
	glBindVertexArray(VertexArrayID);

	glGenBuffers(1, &vbo);

	glBindBuffer(GL_ARRAY_BUFFER, vbo);
	this->vboData = new GLfloat[numVerts * 3];
	memcpy(&this->vboData[0], &vboData[0], sizeof(GLfloat) * 3 * numVerts);
	glBufferData(GL_ARRAY_BUFFER,
		sizeof(GLfloat) * numVerts * 3,
		this->vboData,
		GL_STATIC_DRAW
	);

	this->numVerts = numVerts;
}

void Mesh::setNBOData(GLfloat* nboData, int numVerts)
{
	glGenBuffers(1, &nbo);
	glBindBuffer(GL_ARRAY_BUFFER, nbo);
	glBufferData(
		GL_ARRAY_BUFFER,
		sizeof(GLfloat) * numVerts * 3,
		nboData,
		GL_STATIC_DRAW
	);
}

void Mesh::setIBOData(unsigned int* iboData, int numTris)
{
	glGenBuffers(1, &ibo);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ibo);
	glBufferData(GL_ELEMENT_ARRAY_BUFFER,
		numTris * 3 * sizeof(unsigned int),
		&iboData[0],
		GL_STATIC_DRAW
	);
	this->iboData = iboData;
	this->numTris = numTris;
}
