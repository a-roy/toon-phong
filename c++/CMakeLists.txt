cmake_minimum_required(VERSION 3.3)
set(PROJECT_NAME toon-phong)
project(${PROJECT_NAME})

set(GLEW_PATH glew-1.13.0)
set(GLFW_PATH glfw-3.1.2)
set(GLM_PATH glm-0.9.7.1)
set(DevIL_PATH DevIL-SDK-x86-1.7.8)
set(Assimp_PATH assimp)
set(STB_PATH stb_image)

add_subdirectory(${GLFW_PATH})
include_directories(
	${GLEW_PATH}/include
	${GLFW_PATH}/include
	${GLM_PATH}
	#${DevIL_PATH}/include
	${Assimp_PATH}/include
	#${STB_PATH}
	)
if (WIN32)
	link_directories(
		${GLEW_PATH}/lib/Release/Win32
		#${DevIL_PATH}/lib
		${Assimp_PATH}/lib/x86)
endif (WIN32)

file(GLOB SRC_FILES "*.cpp" "*.hpp")
add_executable(${PROJECT_NAME} ${SRC_FILES})
target_link_libraries(
	${PROJECT_NAME}
	glew32 glu32 opengl32 glfw
	${OPENGL_glu_LIBRARY}
	${GLFW_LIBRARIES}
	#DevIL ILU ILUT
	assimp)

