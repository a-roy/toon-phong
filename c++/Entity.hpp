#ifndef SGE_ENTITY_HPP
#define SGE_ENTITY_HPP

#include <vector>
#include <glm/glm.hpp>
#include <glm\vec3.hpp>
#include <glm\mat4x4.hpp>
#include <glm\gtc\matrix_transform.hpp>
#include <glm/gtc/quaternion.hpp>

#include "Mesh.hpp"
#include "ModelImporter.hpp"
#include "ShaderManager.hpp"

class Entity
{
private:
	std::vector<Mesh*> meshes;
	glm::quat _rotation;
	glm::vec3 _position;
	//glm::vec3 _scale;
	glm::mat4 _modelMatrix;

	Shader* _shader;

	void calcModelMatrix();

public:
	Entity();

	bool loadFromFile(std::string file);
	void draw();
	glm::mat4 getModelMat();

	void rotate(glm::quat r);
	void rotateGlobal(glm::quat r);
	void setRotation(glm::quat r);
	void translate(glm::vec3 t);
	void setPosition(glm::vec3 t);
	//void scale(glm::vec3 s);
	//void setScale(glm::vec3 s);

	void setShader(Shader* s);
	void setShader(std::string shader);
	Shader* getShader();
};

#endif
