import React from 'react';
import Popover from '@material-ui/core/Popover';
import Tooltip from '@material-ui/core/Tooltip';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import Table from '@material-ui/core/Table';

const optimisationMap = {
	0:  "Simple local optimizations",
	1:  "Constant conversion and jumps",
	2:  "Jump optimization",
	3:  "INIT_FCALL_BY_NAME -> DO_FCALL",
	4:  "CFG based optimization",
	5:  "DFA based optimization",
	6:  "CALL GRAPH optimization",
	7:  "SCCP (constant propagation)",
	8:  "TMP VAR usage",
	9:  "NOP removal",
	10: "Merge equal constants",
	11: "Adjust used stack",
	12: "Remove unused variables",
	13: "DCE (dead code elimination",
	14: "(unsafe) Collect constants",
	15: "Inline functions",
	16: "(unsafe) Ignore possibility of operator overloading",
};

function getOptimisationsFromIntLelel(optimisationsBitmap: int) {
    let optimisationsArray = []
	for (let optimisationId = 0; optimisationId <= 16; optimisationId++) {
		if (((1 << optimisationId) & optimisationsBitmap) != 0) {
			optimisationsArray.push(optimisationId);
		}
	}

    return optimisationsArray;
}

function OptimizationPopover(props) {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    const optimisationsArray = getOptimisationsFromIntLelel(props.level);
    
    let descriptionTableRows = [];

    for(let optimisationId in optimisationMap) {
        descriptionTableRows.push(
            <TableRow key={optimisationId}>
                <TableCell>{optimisationId}</TableCell>
                <TableCell>{optimisationMap[optimisationId]}</TableCell>
                <TableCell>{optimisationsArray.indexOf(parseInt(optimisationId)) !== -1 ? <b>enabled</b> : 'disabled'}</TableCell>
            </TableRow>
        );
    }

    return (
        <div>
            <span onClick={handleClick}>{props.level}</span>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Id</TableCell>
                            <TableCell>Optimisation</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>{descriptionTableRows}</TableBody>
                </Table>
            </Popover>
        </div>
        
    );
}

export default OptimizationPopover;