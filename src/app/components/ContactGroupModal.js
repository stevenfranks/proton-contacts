import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { randomIntFromInterval } from 'proton-shared/lib/helpers/function';
import { LABEL_COLORS } from 'proton-shared/lib/constants';
import {
    FormModal,
    useApi,
    Row,
    Label,
    Field,
    Input,
    Select,
    ColorSelector,
    SmallButton,
    PrimaryButton,
    TableHeader,
    TableBody,
    TableRow,
    Table,
    useContactGroups,
    useContactEmails
} from 'react-components';

const ContactGroupTable = ({ contactEmails, onDelete }) => {
    const header = [c('Table header').t`Name`, c('Table header').t`Address`, c('Table header').t`Action`];
    return (
        <Table className="noborder">
            <TableHeader cells={header} />
            <TableBody>
                {contactEmails.map(({ ID, Name, Email }) => {
                    const cells = [
                        Name,
                        Email,
                        <SmallButton key={ID} onClick={onDelete(ID)}>{c('Action').t`Delete`}</SmallButton>
                    ];
                    return <TableRow key={ID} cells={cells} />;
                })}
            </TableBody>
        </Table>
    );
};

ContactGroupTable.propTypes = {
    contactEmails: PropTypes.array,
    onDelete: PropTypes.func
};

const ContactGroupModal = ({ contactGroupID, ...rest }) => {
    const api = useApi();
    const [contactGroups] = useContactGroups();
    const [contactEmails] = useContactEmails();
    const options = contactEmails.map(({ ID, Email, Name }) => ({ label: `${Email} ${Name}`, value: ID }));
    const contactGroup = contactGroupID && contactGroups.find(({ ID }) => ID === contactGroupID);
    const title = contactGroupID ? c('Title').t`Edit contact group` : c('Title').t`Create new group`;

    const [model, setModel] = useState({
        name: contactGroupID ? contactGroup.Name : '',
        color: contactGroupID ? contactGroup.Color : LABEL_COLORS[randomIntFromInterval(0, LABEL_COLORS.length - 1)],
        contactEmailID: contactEmails.length && options[0].value,
        contactEmails: contactGroupID ? contactEmails.filter(({ LabelIDs }) => LabelIDs.includes(contactGroupID)) : []
    });

    const handleChangeName = ({ target }) => setModel({ ...model, name: target.value });
    const handleChangeColor = () => (color) => setModel({ ...model, color });
    const handleChangeEmail = ({ target }) => setModel({ ...model, contactEmailID: target.value });

    const handleAddEmail = () => {
        const contactEmail = contactEmails.find(({ ID }) => ID === model.contactEmailID);
        const alreadyExist = model.contactEmails.find(({ ID }) => ID === model.contactEmailID);

        if (contactEmail && !alreadyExist) {
            const copy = [...model.contactEmails];
            copy.push(contactEmail);
            setModel({ ...model, contactEmails: copy, contactEmailID: options[0].value });
        }
    };

    const handleDeleteEmail = () => (contactEmailID) => {
        const index = model.contactEmails.findIndex({ ID: contactEmailID });

        if (index > -1) {
            const copy = [...model.contactEmails];
            copy.splice(index, 1);
            setModel({ ...model, contactEmails: copy });
        }
    };

    const handleSubmit = () => {
        // TODO
    };

    return (
        <FormModal onSubmit={handleSubmit} submit={c('Action').t`Save`} title={title} {...rest}>
            <Row>
                <Label htmlFor="contactGroupName">{c('Label for contact group name').t`Name`}</Label>
                <Field>
                    <Input
                        id="contactGroupName"
                        placeholder={c('Placeholder for contact group name').t`Name`}
                        value={model.name}
                        onChange={handleChangeName}
                    />
                </Field>
            </Row>
            <Row>
                <Label htmlFor="contactGroupColor">{c('Label for contact group color').t`Color`}</Label>
                <Field>
                    <ColorSelector selected={model.color} onChange={handleChangeColor} />
                </Field>
            </Row>
            {contactEmails.length ? (
                <Row>
                    <Label htmlFor="contactGroupEmail">{c('Label').t`Add email address`}</Label>
                    <Field>
                        <Select
                            id="contactGroupEmail"
                            value={model.contactEmailID}
                            options={options}
                            onChange={handleChangeEmail}
                        />
                        {model.contactEmails.length ? null : (
                            <div className="mt1">{c('Info').t`No contacts added yet`}</div>
                        )}
                    </Field>
                    <div className="ml1">
                        <PrimaryButton onClick={handleAddEmail}>{c('Action').t`Add`}</PrimaryButton>
                    </div>
                </Row>
            ) : null}
            {model.contactEmails.length ? (
                <ContactGroupTable contactEmails={model.contactEmails} onDelete={handleDeleteEmail} />
            ) : null}
        </FormModal>
    );
};

ContactGroupModal.propTypes = {
    contactGroupID: PropTypes.string
};

export default ContactGroupModal;