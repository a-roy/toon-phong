#define M_PI        3.14159265358979323846264338327950288   /* pi */
#define M_PI_2      1.57079632679489661923132169163975144   /* pi/2 */
#define M_PI_4      0.785398163397448309615660845819875721  /* pi/4 */
#include <iostream>

#include <GL\glew.h>
#include <GLFW/glfw3.h>

#include "ShaderManager.hpp"
#include "Entity.hpp"

GLFWwindow* window;

bool mouseClicked = false;
double mouseX;
double mouseY;

bool initWindow(const char *title)
{
	if (!glfwInit())
	{
		std::cout << "ERROR: Could not initialise GLFW...";
		std::cin;
		return false;
	}

	glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
	glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

	window = glfwCreateWindow(800, 800, title, NULL, NULL);
	if (!window)
	{
		glfwTerminate();
		std::cout << "ERROR: Could not create winodw...";
		std::cin;
		return false;
	}

	glfwMakeContextCurrent(window);

	std::cout << "OpenGL version: " << glGetString(GL_VERSION) << std::endl;

	glewExperimental = GL_TRUE;
	GLenum err = glewInit();

	if (err != GLEW_OK)
	{
		std::cout << "ERROR: Problem initialising GLEW: " << glewGetErrorString(err);
		std::cin;
		return false;
	}

	glViewport(0, 0, 800, 800);

	return true;
}

void handleInput(Entity &e)
{
	/*if (glfwGetMouseButton(window, GLFW_MOUSE_BUTTON_1))
	{
		if (!mouseClicked)
		{
			mouseClicked = true;
			glfwGetCursorPos(window, &mouseX, &mouseY);
		}
		else
		{
			double x, y;
			glfwGetCursorPos(window, &x, &y);
			glm::quat rotation;
			glm::rotate(rotation, (float)(x - mouseX), glm::vec3(0, 1, 0));
			glm::rotate(rotation, (float)(y - mouseY), glm::vec3(1, 0, 0));
			e.rotate(rotation);
			mouseX = x;
			mouseY = y;
		}
	}*/
	if (glfwGetKey(window, GLFW_KEY_A) == GLFW_PRESS)
	{
		e.rotateGlobal(glm::rotate(glm::quat(), -0.1f, glm::vec3(0, 1, 0)));
	}
	else if (glfwGetKey(window, GLFW_KEY_D) == GLFW_PRESS)
	{
		e.rotateGlobal(glm::rotate(glm::quat(), 0.1f, glm::vec3(0, 1, 0)));
	}
	if (glfwGetKey(window, GLFW_KEY_W) == GLFW_PRESS)
	{
		e.rotateGlobal(glm::rotate(glm::quat(), -0.1f, glm::vec3(1, 0, 0)));
	}
	else if (glfwGetKey(window, GLFW_KEY_S) == GLFW_PRESS)
	{
		e.rotateGlobal(glm::rotate(glm::quat(), 0.1f, glm::vec3(1, 0, 0)));
	}
	if (glfwGetKey(window, GLFW_KEY_Q) == GLFW_PRESS)
	{
		e.rotateGlobal(glm::rotate(glm::quat(), 0.1f, glm::vec3(0, 0, 1)));
	}
	else if (glfwGetKey(window, GLFW_KEY_E) == GLFW_PRESS)
	{
		e.rotateGlobal(glm::rotate(glm::quat(), -0.1f, glm::vec3(0, 0, 1)));
	}
}

int main()
{
	if (!initWindow("Toon-Phong"))
		return -1;

	// Load stuff here
	Entity suzanne;
	suzanne.loadFromFile("../models/monkey_MODEL.dae");
	Shader *toon_phong = ShaderManager::loadShader("toon-phong");
	Shader *outline = ShaderManager::loadShader("outline");
	glm::quat rotation;
	rotation = glm::rotate(rotation, (float)M_PI, glm::vec3(0, 0, 1));
	rotation = glm::rotate(rotation, (float)M_PI_2, glm::vec3(1, 0, 0));
	suzanne.setRotation(rotation);

	glm::mat4 projectionMatrix = glm::perspective(
		45.0f,
		1.0f,
		0.1f,
		1000.0f
	);

	glm::mat4 viewMatrix = glm::lookAt(
		glm::vec3(0.0f,0.0f,5.0f),
		glm::vec3(0.0f,0.0f,0.0f),
		glm::vec3(0.0f,1.0f,0.0f)
	);

	glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
	glEnable(GL_BLEND);
	glDepthFunc(GL_LEQUAL);
	//glEnable(GL_DEPTH_TEST);
	glEnable(GL_CULL_FACE);
	while (!glfwWindowShouldClose(window))
	{
		handleInput(suzanne);

		glClearColor(0.3f, 0.3f, 0.3f, 1.0f);
		glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

		// Draw stuff here
		suzanne.setShader(outline);
		outline->setUniformMatrix4fv("projectionMatrix", projectionMatrix);
		outline->setUniformMatrix4fv("viewMatrix", viewMatrix);
		glCullFace(GL_FRONT);
		glDisable(GL_DEPTH_TEST);
		suzanne.draw();
		suzanne.setShader(toon_phong);
		toon_phong->setUniformMatrix4fv("projectionMatrix", projectionMatrix);
		toon_phong->setUniformMatrix4fv("viewMatrix", viewMatrix);
		glCullFace(GL_BACK);
		glEnable(GL_DEPTH_TEST);
		suzanne.draw();

	    glDisable(GL_TEXTURE_GEN_S);
		glDisable(GL_TEXTURE_GEN_T);
		glDisable(GL_TEXTURE_GEN_R);
		glEnable(GL_TEXTURE_GEN_S);
		glEnable(GL_TEXTURE_GEN_T);
		glEnable(GL_TEXTURE_GEN_R);

		glfwSwapBuffers(window);
		glfwPollEvents();
	}

	glfwTerminate();
	return 0;
}
