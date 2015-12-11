#include "Model.hpp"

Model::Model(std::vector<GLfloat> vertices, std::vector<GLuint> indices)
{
	_shader = NULL;
	_modelMatrix = glm::mat4();
	_rotation = glm::quat();
	_position = glm::vec3(0.0f, 0.0f, 0.0f);

	// Allocate buffers
	glGenVertexArrays(1, &_VAO);
	glGenBuffers(1, &_VBO);
	glGenBuffers(1, &_EBO);

	// Bind VAO
	glBindVertexArray(_VAO);

	// Send vertices
	glBindBuffer(GL_ARRAY_BUFFER, _VBO);
	glBufferData(GL_ARRAY_BUFFER, sizeof(GLfloat) * vertices.size(), &vertices[0], GL_STATIC_DRAW);

	// Send indices
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, _EBO);
	glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(GLuint) * indices.size(), &indices[0], GL_STATIC_DRAW);

	glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(GLfloat), NULL);
	glEnableVertexAttribArray(0);

	// Unbind VAO and VBO
	glBindBuffer(GL_ARRAY_BUFFER, 0);
	glBindVertexArray(0);
}

Model Model::Cube()
{
	// Vertices
	GLfloat v[] =
	{
		0.5f, 0.5f, 0.5f,
		0.5f, -0.5f, 0.5f,
		-0.5f, -0.5f, 0.5f,
		-0.5f, 0.5f, 0.5f,

		0.5f, 0.5f, -0.5f,
		0.5f, -0.5f, -0.5f,
		-0.5f, -0.5f, -0.5f,
		-0.5f, 0.5f, -0.5f,
	};

	// Vertex indices
	GLuint i[] =
	{
		// Front Face
		0, 3, 1,
		1, 3, 2,

		// Right Face
		4, 0, 5,
		1, 5, 0,

		// Back Face
		7,4,6,
		4,5,6,

		// Left Face
		7,2,3,
		6,2,7,

		// Top Face
		7,3,4,
		4,3,0,

		// Bottom Face
		6,5,2,
		1,2,5
	};

	std::vector<GLfloat> vertices(v, v + sizeof(v) / sizeof(GLfloat));
	std::vector<GLuint> indices(i, i + sizeof(i) / sizeof(GLuint));

	Model m(vertices, indices);
	return m;
}

Model Model::Pyramid()
{
	GLfloat v[] =
	{
		0.0f, 0.5f, 0.0f,
		0.5f, -0.5f, 0.5f,
		-0.5f, -0.5f, 0.5f,
		0.5f, -0.5f, -0.5f,
		-0.5f, -0.5f, -0.5f,
	};

	GLuint i[] =
	{
		0, 1, 2,
		0, 3, 1,
		0, 4, 3,
		0, 2, 4,
		4, 3, 2,
		1, 2, 3
	};

	std::vector<GLfloat> vertices(v, v + sizeof(v) / sizeof(v[0]));
	std::vector<GLuint> indices(i, i + sizeof(i) / sizeof(i[0]));

	Model m(vertices, indices);
	return m;
}

void Model::draw()
{
	if (_shader != NULL)
	{
		_shader->enableShader();
		_shader->setUniformMatrix4fv("modelMat", _modelMatrix);
	}

	glBindVertexArray(_VAO);
	glDrawElements(GL_TRIANGLES, 6 * 6, GL_UNSIGNED_INT, 0);
	glBindVertexArray(0);
}

void Model::setShader(Shader* s)
{
	_shader = s;
}

void Model::setShader(std::string shader)
{
	Shader* s = ShaderManager::getShader(shader);
	if (s != NULL)
	{
		setShader(s);
	}
}

Shader* Model::getShader()
{
	return _shader;
}

void Model::rotate(glm::quat rotation)
{
	_rotation = _rotation * rotation;
	setModelMatrix();
}

void Model::rotateGlobal(glm::quat rotation)
{
	glm::mat4 transform = glm::mat4(1.0f);
	transform = glm::translate(transform, -_position);
	_position = glm::vec3(glm::mat4_cast(rotation) * glm::vec4(_position, 1.0f));
	_rotation = rotation * _rotation;
	setModelMatrix();
}

void Model::setRotation(glm::quat rotation)
{
	_rotation = rotation;
	setModelMatrix();
}

void Model::translate(glm::vec3 translation)
{
	_position += translation;
	setModelMatrix();
}

void Model::setPosition(glm::vec3 position)
{
	_position = position;
	setModelMatrix();
}

void Model::setModelMatrix()
{
	_modelMatrix = glm::mat4(1.0f);
	_modelMatrix = glm::translate(_modelMatrix, _position);
	_modelMatrix *= glm::mat4_cast(_rotation);
}
