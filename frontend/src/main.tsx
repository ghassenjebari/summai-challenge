import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import { Container, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <MantineProvider  >
            <Container size="xxl" pt="md" px="md">
                <App />
            </Container>
        </MantineProvider>
    </React.StrictMode>
);
