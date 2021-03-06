#Clone SFML from its official directory using Git
find_package(Git)
if(GIT_FOUND)
	message( "Cloning SFML in ExtLibs/SFML with Git..." )
	execute_process(
		COMMAND ${GIT_EXECUTABLE} clone "https://www.github.com/SFML/SFML.git" SFML
		WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/
		ERROR_QUIET
		OUTPUT_QUIET)

	message( "Resetting SFML source code to version 2.4.1..." )
	execute_process(
		COMMAND ${GIT_EXECUTABLE} reset --hard 2.4.1
		WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/SFML
		ERROR_QUIET
		OUTPUT_QUIET)

	message( "Applying the patches..." )
	file(GLOB SFML_PATCHES
     	LIST_DIRECTORIES FALSE
		${CMAKE_CURRENT_SOURCE_DIR}/SFML-patches/*.patch)

	if(SFML_PATCHES)
		list(SORT SFML_PATCHES)

		foreach(SFML_PATCH ${SFML_PATCHES})
			message( "Applying patch: ${SFML_PATCH}..." )
			execute_process(
				COMMAND ${GIT_EXECUTABLE} apply ${SFML_PATCH}
				WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/SFML
				ERROR_QUIET
				OUTPUT_QUIET)
		endforeach()
	endif()
else()
	message( "Git not found, make sure you have SFML >= 2.4 in ExtLibs/SFML and you applied the needed patches (from ExtLibs/SFML-patches)!" )
endif()

#SFML:
IF(NOT EMSCRIPTEN) #Don't build SFML binaries when compiling with emscripten (but keep include files!)
	add_subdirectory(SFML)
	set(sfml_lib_dir ${CMAKE_BINARY_DIR}/ExtLibs/SFML/lib PARENT_SCOPE)
	set(sfml_LIBRARIES sfml-audio sfml-graphics sfml-window sfml-network sfml-system)
	IF(WIN32)
		set(sfml_LIBRARIES "${sfml_LIBRARIES}" ws2_32 user32 opengl32 glu32 psapi)
	ELSEIF(NOT APPLE)
		set(sfml_LIBRARIES "${sfml_LIBRARIES}" GLU GL)
	ENDIF()
	set(sfml_LIBRARIES "${sfml_LIBRARIES}" PARENT_SCOPE)
ENDIF()
set(sfml_include_dir ${CMAKE_CURRENT_SOURCE_DIR}/SFML/include PARENT_SCOPE)

#wxWidgets:
IF(NOT NO_GUI)
	IF(WIN32)
		#Precompiled wxWidgets on Windows:
		IF(NOT EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/wxwidgets")
			message( "Downloading precompiled version of wxWidgets... (can take a bit of time, be patient)" )
			execute_process(COMMAND curl -o wxwidgets.7z http://www.compilgames.net/code/GameDevelopSDK/wxwidgets.7z -\# WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/ )
			message( "Extracting wxWidgets in ExtLibs/wxWidgets... (can take a bit of time, be patient)" )
			execute_process(COMMAND 7za x -y wxwidgets.7z WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/ OUTPUT_QUIET)
		ENDIF()

		set(wxwidgets_include_dir "${GD_base_dir}/ExtLibs/wxwidgets/include" "${GD_base_dir}/ExtLibs/wxwidgets/lib/gcc_dll/mswu" PARENT_SCOPE)
		set(wxwidgets_lib_dir "${GD_base_dir}/ExtLibs/wxwidgets/lib/gcc_dll")
		set(wxwidgets_lib_dir "${wxwidgets_lib_dir}" PARENT_SCOPE)
		set(wxWidgets_LIBRARIES ${wxwidgets_lib_dir}/libwxmsw30u_xrc.a ${wxwidgets_lib_dir}/libwxmsw30u_stc.a ${wxwidgets_lib_dir}/libwxmsw30u_richtext.a ${wxwidgets_lib_dir}/libwxmsw30u_propgrid.a ${wxwidgets_lib_dir}/libwxmsw30u_ribbon.a ${wxwidgets_lib_dir}/libwxmsw30u_aui.a ${wxwidgets_lib_dir}/libwxmsw30u_adv.a ${wxwidgets_lib_dir}/libwxmsw30u_html.a ${wxwidgets_lib_dir}/libwxmsw30u_core.a ${wxwidgets_lib_dir}/libwxbase30u_xml.a ${wxwidgets_lib_dir}/libwxbase30u_net.a ${wxwidgets_lib_dir}/libwxexpat.a ${wxwidgets_lib_dir}/libwxbase30u.a ${wxwidgets_lib_dir}/libwxpng.a ${wxwidgets_lib_dir}/libwxjpeg.a ${wxwidgets_lib_dir}/libwxzlib.a ${wxwidgets_lib_dir}/libwxtiff.a)
		set(wxWidgets_LIBRARIES ${wxWidgets_LIBRARIES} ws2_32 user32 opengl32 glu32)
		set(wxWidgets_LIBRARIES ${wxWidgets_LIBRARIES} PARENT_SCOPE)
	ELSE()
		#Use wx-config on *nix:
		find_package(wxWidgets REQUIRED)
		IF (NOT APPLE)
			find_package(PkgConfig REQUIRED)
			EXEC_PROGRAM(${wxWidgets_CONFIG_EXECUTABLE} ARGS --query-toolkit OUTPUT_VARIABLE WXWIDGETS_GTK_VERSION)
			IF(${WXWIDGETS_GTK_VERSION} MATCHES "gtk2")
				pkg_check_modules(GTK2 REQUIRED gtk+-2.0)
				set(GTK_INCLUDE_DIRS "${GTK2_INCLUDE_DIRS}" PARENT_SCOPE)
				set(GTK_LIBRARY_DIRS "${GTK2_LIBRARY_DIRS}" PARENT_SCOPE)
				set(GTK_CFLAGS_OTHER "${GTK2_CFLAGS_OTHER}" PARENT_SCOPE)
			ELSEIF(${WXWIDGETS_GTK_VERSION} MATCHES "gtk3")
				pkg_check_modules(GTK3 REQUIRED gtk+-3.0)
				set(GTK_INCLUDE_DIRS "${GTK3_INCLUDE_DIRS}" PARENT_SCOPE)
				set(GTK_LIBRARY_DIRS "${GTK3_LIBRARY_DIRS}" PARENT_SCOPE)
				set(GTK_CFLAGS_OTHER "${GTK3_CFLAGS_OTHER}" PARENT_SCOPE)
			ELSE()
				message(WARNING "Unable to identify the GTK+ version used by wxWidgets")
				set(GTK_INCLUDE_DIRS "" PARENT_SCOPE)
				set(GTK_LIBRARY_DIRS "" PARENT_SCOPE)
				set(GTK_CFLAGS_OTHER "" PARENT_SCOPE)
			ENDIF()
		ENDIF()
	ENDIF()
ENDIF()
