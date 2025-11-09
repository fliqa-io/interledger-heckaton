# Fliqa interledger-hackaton backend application

This directory contains the backend application for the Fliqa interledger hackaton.

## Getting Started

### Prerequisites

* java 21

### Building the application, running tests

Using gradle wrapper will download gradle and all application dependencies.
This will also run all tests.

```shell
./gradlew build
```

### Running the application

Being a demo application, it runs only in quarkus dev mode. To start the
application, run:

```shell
./gradlew quarkusDev
```

This will start the application and all required dependent services (database
server, smtp server).

Upon startup, database tables will be created and initial data will be loaded from
`src/main/resources/import.sql`.

Quarkus development services can be used to examine mail messages sent by the
application. See: http://localhost:8080/q/dev-ui/quarkus-mailpit/mailpit-ui 



The application requires `interledger-private-key.pem` file in the root
directory containing the private key to access interledger API. 

This file is not included in the repository. 

You also have to set following properties in `application.properties` file:
 * `io.fliqa.interledger.private_key_file`=interledger-private-key.pem
 * `io.fliqa.interledger.intermediate_wallet`=YOUR_INTERMEDIATE_WALLET_ADDRESS
 * `io.fliqa.interledger.key_id`=YOUR_KEY_ID

