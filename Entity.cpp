#include "Entity.hpp"

Entity::Entity()
{
	_shader = NULL;
	this->_modelMatrix = glm::mat4(1.0f);
	_rotation = glm::quat();
	_position = glm::vec3(0.0f, 0.0f, 0.0f);
}

bool Entity::loadFromFile(std::string file)
{
	ModelImporter* importer = new ModelImporter();
	importer->importModel(file);
	this->meshes = importer->getMeshes();
	return true;
}

void Entity::draw()
{
	if (this->_shader != NULL)
	{
		this->_shader->enableShader();
		this->_shader->setUniformMatrix4fv("modelMat", this->_modelMatrix);
	}

	for(int i = 0; i < this->meshes.size(); ++i)
	{
		this->meshes[i]->renderGL();
	}
}

glm::mat4 Entity::getModelMat()
{
	return this->_modelMatrix;
}

void Entity::setShader(Shader* s)
{
	this->_shader = s;
}

void Entity::setShader(std::string shader)
{
	Shader* s = ShaderManager::getShader(shader);
	if (s != NULL)
	{
		this->setShader(s);
	}
}

Shader* Entity::getShader()
{
	return this->_shader;
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

void Model::calcModelMatrix()
{
	_modelMatrix = glm::mat4(1.0f);
	_modelMatrix = glm::translate(_modelMatrix, _position);
	_modelMatrix *= glm::mat4_cast(_rotation);
}
