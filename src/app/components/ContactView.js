import React from 'react';
import { c } from 'ttag';
import PropTypes from 'prop-types';
import { useModals, PrimaryButton, Button, useUser } from 'react-components';
import downloadFile from 'proton-shared/lib/helpers/downloadFile';

import ContactModal from './ContactModal';
import ContactViewErrors from './ContactViewErrors';
import { toICAL } from '../helpers/vcard';
import ContactSummary from './ContactSummary';
import ContactViewProperties from './ContactViewProperties';
import UpsellFree from './UpsellFree';

const ContactView = ({ properties = [], contactID, contactEmails, contactGroupsMap, userKeysList, errors }) => {
    const { createModal } = useModals();
    const [user] = useUser();

    const openContactModal = () => {
        createModal(<ContactModal properties={properties} contactID={contactID} />);
    };

    const handleExport = () => {
        const filename = properties
            .filter(({ field }) => ['fn', 'email'].includes(field))
            .map(({ value }) => (Array.isArray(value) ? value[0] : value))[0];
        const vcard = toICAL(properties);
        const blob = new Blob([vcard.toString()], { type: 'data:text/plain;charset=utf-8;' });

        downloadFile(blob, `${filename}.vcf`);
    };

    return (
        <div className="view-column-detail flex-item-fluid scroll-if-needed">
            <div className="flex flex-spacebetween flex-items-center border-bottom">
                <div className="p1">
                    <h2 className="m0">{c('Title').t`Contact details`}</h2>
                </div>
                <div className="p1">
                    <PrimaryButton onClick={openContactModal} className="mr1">{c('Action').t`Edit`}</PrimaryButton>
                    <Button onClick={handleExport}>{c('Action').t`Export`}</Button>
                </div>
            </div>
            <ContactViewErrors errors={errors} />
            <ContactSummary properties={properties} />
            <div className="pl1 pr1">
                <ContactViewProperties
                    userKeysList={userKeysList}
                    contactID={contactID}
                    contactEmails={contactEmails}
                    contactGroupsMap={contactGroupsMap}
                    properties={properties}
                    field="email"
                />
                {user.hasPaidMail ? (
                    <>
                        <ContactViewProperties contactID={contactID} properties={properties} field="tel" />
                        <ContactViewProperties contactID={contactID} properties={properties} field="adr" />
                        <ContactViewProperties contactID={contactID} properties={properties} />
                    </>
                ) : (
                    <UpsellFree />
                )}
            </div>
        </div>
    );
};

const ContactPropertyPropTypes = PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    type: PropTypes.string,
    group: PropTypes.string,
    field: PropTypes.string
});

ContactView.propTypes = {
    contactID: PropTypes.string.isRequired,
    contactEmails: PropTypes.arrayOf(PropTypes.object),
    contactGroupsMap: PropTypes.object,
    properties: PropTypes.arrayOf(ContactPropertyPropTypes),
    userKeysList: PropTypes.array,
    errors: PropTypes.array
};

export default ContactView;
