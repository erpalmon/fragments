# Dockerize fragments Microservice
#
# In the root of your fragments microservice project, create a new file named Dockerfile. NOTE: the capital D is intentional, and there is no extension. This is a text file that will define all of the Docker instructions necessary for Docker Engine to build an image of your service.
#
# At the very top of your file, add a comment that explains what this file is. A comment in a Dockerfile begins with a #. You can (and should) include as many comment lines as you think are necessary to explain how your code works. Especially while you are learning, this is a great opportunity to write yourself notes about why you did certain things, give links to documentation, and explain things that may not be obvious. You can also use blank lines, which Docker will ignore, but are useful for breaking up the file in order to make it more readable. Having comments and vertical whitespace is important for maintainability.

# Every Dockerfile must begin with a FROM instruction. This specifies the parent (or base) image to use as a starting point for our own image. Our fragments image will be based on other Docker images. This helps us avoid duplicating work across projects. For example, we could base our Dockerfile on an image like ubuntu or amazonlinux. However, doing so would mean that we'd have to manually install and configure things like node.js, which our service requires. A better option is to pick one of the official node base images, which already has node.js plus everything else we need:
#
# FROM node
# Saying that we want to use node would work. However, this doesn't specify a particular version of node. We do that by adding a :tag, for example: node:18 or node:lts. Because we are trying to make sure that our image is as close to our development environment as possible, we want to use a specific version. You can be very specific if you need to be:

# Use node version 24.7.0
FROM node:24.7.0

# Pick a version that closely matches the node version you are using locally (i.e., node --version will tell you). As we continue to develop our project, and as node.js makes new releases, we will update this version accordingly. Our current choice is only for this image, and we will make more images later.

# After your FROM instruction, leave a blank line then define some metadata about your image. The LABEL instruction adds key=value pairs with arbitrary metadata about your image. For example, you can indicate who is maintaining this image (you are, so use your name/email), and what this image is for. Here's an example, which you can update for your own project:
LABEL maintainer="Ella Palmon <erpalmon@myseneca.ca>"
LABEL description="Fragments node.js microservice for BTI525 (https://github.com/erpalmon/fragments)"

# Leave another blank like, then define any environment variables you want to include. We define environment variables using the ENV instruction, which also uses key=value pairs like LABEL. Environment variables become part of the built image, and will persist in any containers run using this image. We'll provide default values, but they can be overridden at runtime using the --env, -e or --env-file flags. You can define variables for your application, but also for your build/runtime tools:

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# NOTE: we haven't included some environment variables that don't make sense in a Dockerfile. For example, we don't want to include secrets, nor do we want to define things that will always be different. These we can define at run-time instead of build-time. Our Amazon Cognito variables are a good example of something that we can't put in the Dockerfile, since they will always be different.

# Leave another blank like, then define and create our app's working directory. The base images we use (e.g., node) will already define a filesystem for us (i.e., a Linux distro with node.js installed). However, we need to create a directory for our application. This can be named and located whatever you want in the existing filesystem. A logical place might be /app: an app directory in the root:

# Use /app as our working directory
WORKDIR /app

# This will create the /app directory, since it won't exist, and then enter it (i.e., cd /app), so that all subsequent commands will be relative to /app. You can use the WORKDIR instruction as many times as you need to in your Dockerfile.

# Leave another blank line, then copy your application's package.json and package-lock.json files into the image. Our project depends on many dependencies (defined in package.json) and these dependencies also have dependencies at a specific version (defined in package-lock.json). We use the COPY instruction to copy files and folders into our image. In its most basic form, we use COPY <src> <dest>. This copies from the build context (i.e. our <src>) to a path inside the image (i.e., our <dest>). The build context includes all of the files and directories in and below the path where docker build is run. This will typically be in the same directory as the Dockerfile.
#
# The syntax for how we define the <src> and <dest> in a COPY instruction can differ. Here are some examples of different ways we could write it. All of these accomplish the same thing, but they are written differently:

# Option 2: relative path - Copy the package.json and package-lock.json
# files into the working dir (/app).  NOTE: this requires that we have
# already set our WORKDIR in a previous step.
COPY package*.json ./

# Leave another blank line, then we need to install our dependencies. We use the RUN instruction to execute a command and cache this layer (i.e., we can reuse it later if package.json/package-lock.json haven't changed):
# Install node dependencies defined in package-lock.json
RUN npm install

# Leave another blank line, then copy your server's source code into the image. All of our code is conveniently located in a src/ directory, and we need to end up with our code at /app/src. We can do that with:

# Copy src to /app/src/
COPY ./src ./src

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# Our final step is to define the command to run in order to start our container. A Docker container is really a single process, and we need to tell Docker how to start this process. In our case, we can do that with the command npm start, and we use the CMD instruction to define it:

# We run our service on port 8080
EXPOSE 8080

# Start the container by running our server
CMD npm start
