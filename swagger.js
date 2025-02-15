import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Issue Reporting API",
      version: "1.0.0",
      description: "API documentation for the issue reporting system",
    },
    tags: [
      {
        name: "Issues",
        description: "APIs related to issue management",
      },
      {
        name: "Students",
        description: "APIs related to student operations",
      },
      {
        name: "Workers",
        description: "APIs related to worker management",
      },
      {
        name: "Admin",
        description: "APIs for admin management",
      },
    ],
    servers: [
      {
        url: "http://localhost:4000",
        description: "Local Development Server",
      },
      {
        url: "https://hostel-saathi-backend.onrender.com",
        description: "Production Server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ BearerAuth: [] }], 
  },
  apis: ["./components/**/*.router.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
