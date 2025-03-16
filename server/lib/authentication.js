import jwt from 'jsonwebtoken';

export default async (request, reply) => {
  // Get the token from the cookie or Authorization header
  const token =
    request.cookies?.token || request.headers?.authorization?.split(' ')[1];

  if (!token) {
    return reply.status(401).view('index.pug', {
      title: "You\'re not allowed,",
      message: "since you\'re not signed in",
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    request.user = decoded; // Attach the decoded user information to the request object
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return reply.status(401).view('index.pug', {
      title: 'Failed to authenticate',
      message: 'Internal server error',
    });
  }
};
