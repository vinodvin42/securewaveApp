import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

const Dashboard = () => {
  return (
    <div className="bg-light">
      {/* Content */}
      <Container fluid className="mt-4">
        <Row>
          <Col md={12}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Dashboard Overview</Card.Title>
                <Card.Text>
                  This is where you can manage your application.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;
