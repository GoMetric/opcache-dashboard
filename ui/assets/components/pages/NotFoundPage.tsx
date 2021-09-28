import React from 'react';
import { Typography } from "@material-ui/core";
import {FormattedMessage} from "react-intl";

export default function StatusPage() {
    return (
        <Typography>
            <FormattedMessage defaultMessage='Page not found'/>
        </Typography>
    );
}
