import React from 'react';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { FormControl, InputLabel } from '@material-ui/core';

function HostGroupSelect(props) {
    if (!props.groupNames || props.groupNames.length === 0) {
        return <div>No groups in cluster</div>
    }

    let clusterGroupButtons = props.groupNames.map(
        (groupName: string) => {
            return (
                <MenuItem value={groupName} key={groupName}>
                    {groupName}
                </MenuItem>
            );
        }
    );

    const [selectedGroupName, setSelectedGroupName] = React.useState(
        props.selectedGroupName
    );

    const groupChanged = (event: React.ChangeEvent<{ value: unknown }>) => {
        const selectedGroupName = event.target.value;

        setSelectedGroupName(selectedGroupName);

        if (typeof props.onChange === "function") {
            props.onChange(selectedGroupName);
        }
    };

    return (
        <FormControl variant="outlined">
            <InputLabel>Group</InputLabel>
            <Select
                value={selectedGroupName}
                onChange={groupChanged}
                label="Group"
            >
                {clusterGroupButtons}
            </Select>
        </FormControl>
    );
}

export default HostGroupSelect;