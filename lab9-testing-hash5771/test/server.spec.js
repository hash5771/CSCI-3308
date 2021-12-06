// Imports the server.js file to be tested.
const server = require("../server");
// Assertion (Test Driven Development) and Should,  Expect(Behaviour driven 
// development) library
const chai = require("chai");
// Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require("chai-http");
const { application } = require("express");
chai.should();
chai.use(chaiHttp);
const { assert, expect } = chai;

describe("Server!", () => {
  // Sample test case given to test / endpoint.
  it("Returns the default welcome message", (done) => {
    chai
      .request(server)
      .get("/")
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals("success");
        assert.strictEqual(res.body.message, "Welcome!");
        done();
      });
  });

  // ===========================================================================
  // TODO: Please add your test cases for part A here.
  it('It should be an array', (done) => {
    chai
    .request(server)
    .get("/operations")
    .end((err, res) => {
      expect(res.body).to.be.an.instanceOf(Array);
      expect(res.body).to.not.be.empty;
      done();
    });
  });

  it('It has id = 1, property = name / sign', (done) => {
    chai
    .request(server)
    .get("/operations/1")
    .end((err, res) => {
      expect(res.body.id).to.equal(1);
      expect(res.body).to.have.ownPropertyDescriptor('name');
      expect(res.body).to.have.ownPropertyDescriptor('sign');
      done();
    });
  });

  it('It has id = 4, name = newOp, sign = newSign', (done) => {
    const ops =
    {
      name: 'Division',
      sign: '/'
    };
    chai
    .request(server)
    .post("/operations")
    .send(ops)
    .end((err, res) => {
      expect(res.body.id).to.equal(4);
      expect(res.body).to.have.ownPropertyDescriptor('name');
      expect(res.body.name).to.equal(ops.name);
      expect(res.body).to.have.ownPropertyDescriptor('sign');
      expect(res.body.sign).to.equal(ops.sign);
      done();
    });
  });

  // ===========================================================================
  // TODO: Please add your test cases for part B here.

  it('Addition with two positive numbers', (done) => {
    chai
    .request(server)
    .post("/add")
    .send({
      numberOne: 1,
      numberTwo: 2
    })
    .end((err, res) => {
      expect(res.body.result).to.equal(3);
      done();
    });
  });

  it('Addition with two negative numbers', (done) => {
    chai
    .request(server)
    .post("/add")
    .send({
      numberOne: -1,
      numberTwo: -2
    })
    .end((err, res) => {
      expect(res.body.result).to.equal(-3);
      done();
    });
  });

  it('Division with two positive numbers', (done) => {
    chai
    .request(server)
    .post("/divide")
    .send({
      numberOne: 2,
      numberTwo: 1
    })
    .end((err, res) => {
      expect(res.body.result).to.equal(2);
      done();
    });
  });

  it('Division with two negative numbers', (done) => {
    chai
    .request(server)
    .post("/divide")
    .send({
      numberOne: -2,
      numberTwo: -1
    })
    .end((err, res) => {
      expect(res.body.result).to.equal(2);
      done();
    });
  });

  it('Addition should fail', (done) => {
    chai
    .request(server)
    .post("/add")
    .send({
      numberOne: "hello",
      numberTwo: 1
    })
    .end((err, res) => {
      assert.strictEqual(res.status, 400);
      done();
    });
  });

  
  it('Division should fail', (done) => {
    chai
    .request(server)
    .post("/divide")
    .send({
      numberOne: "world",
      numberTwo: 1
    })
    .end((err, res) => {
      assert.strictEqual(res.status, 400);
      done();
    });
  });
});
