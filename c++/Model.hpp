#ifndef MODEL_HPP
#define MODEL_HPP

#include <GL/glew.h>
#include <glm/vec3.hpp>
#include <glm/mat4x4.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/quaternion.hpp>

#include <vector>

#include "ShaderManager.hpp"

class Model
{
	private:
		glm::quat _rotation;
		glm::vec3 _position;
		glm::mat4x4 _modelMatrix;

		GLuint _VBO;
		GLuint _VAO;
		GLuint _EBO;

		Shader* _shader;

		void setModelMatrix();

	public:
		Model(std::vector<GLfloat> vertices, std::vector<GLuint> indices);

		static Model Cube();
		static Model Pyramid();

		void draw();

		void rotate(glm::quat r);
		void rotateGlobal(glm::quat r);
		void setRotation(glm::quat r);
		void translate(glm::vec3 t);
		void setPosition(glm::vec3 t);

		void setShader(Shader* s);
		void setShader(std::string shader);
		Shader* getShader();
};

#endif
