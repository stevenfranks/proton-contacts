import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Row, Group, Button, Icon, useModals, useUser, classnames } from 'react-components';

import { clearType, getType, formatAdr } from '../helpers/property';
import ContactGroupIcon from './ContactGroupIcon';
import ContactGroupDropdown from './ContactGroupDropdown';
import ContactLabelProperty from './ContactLabelProperty';
import ContactEmailSettingsModal from './ContactEmailSettingsModal';
import TooltipCopy from '../components/TootipCopy';

const ContactViewProperty = ({
    property,
    properties,
    contactID,
    contactEmail,
    contactGroups = [],
    leftBlockWidth = 'w30',
    rightBlockWidth = 'w70'
}) => {
    const { field, first } = property;
    const [{ hasPaidMail }] = useUser();
    const { createModal } = useModals();
    const type = clearType(getType(property.type));
    const value = property.value;

    const getContent = () => {
        switch (field) {
            case 'email': {
                return (
                    <>
                        <a className="mr0-5" href={`mailto:${value}`} title={value}>
                            {value}
                        </a>
                        {contactGroups.map(({ ID, Name, Color }) => (
                            <ContactGroupIcon key={ID} name={Name} color={Color} />
                        ))}
                    </>
                );
            }
            case 'url':
                return (
                    <a href={value} target="_blank" rel="noopener noreferrer">
                        {value}
                    </a>
                );
            case 'tel':
                return <a href={`tel:${value}`}>{value}</a>;
            case 'bday':
            case 'anniversary': {
                const date = moment(value);
                if (date.isValid()) {
                    return date.format('LL');
                }
                return value;
            }
            case 'photo':
            case 'logo':
                return <img src={value} alt={field} />;
            case 'adr':
                return formatAdr(value);
            default:
                return value;
        }
    };

    const getActions = () => {
        switch (field) {
            case 'email': {
                if (!contactEmail) {
                    return null;
                }

                const handleSettings = () => {
                    createModal(
                        <ContactEmailSettingsModal
                            contactID={contactID}
                            contactEmail={contactEmail}
                            properties={properties}
                        />
                    );
                };

                return (
                    <Group>
                        {hasPaidMail ? (
                            <>
                                <ContactGroupDropdown
                                    className="pm-button pm-button--small pm-group-button mr0-5"
                                    contactEmails={[contactEmail]}
                                >
                                    <Icon name="contacts-groups" />
                                </ContactGroupDropdown>
                                <Button onClick={handleSettings} className="pm-button--small mr0-5">
                                    <Icon name="settings-singular" />
                                </Button>
                            </>
                        ) : null}
                        <TooltipCopy className="pm-button--small" value={value} />
                    </Group>
                );
            }
            case 'tel':
                return <TooltipCopy className="pm-button--small" value={value} />;
            case 'adr':
                return <TooltipCopy className="pm-button--small" value={formatAdr(value)} />;
            default:
                return null;
        }
    };

    return (
        <Row>
            <div className={leftBlockWidth}>
                <ContactLabelProperty field={field} type={type} first={first} />
            </div>
            <div className={classnames(['flex flex-nowrap flex-items-center pl1', rightBlockWidth])}>
                <span className={classnames(['mr0-5 flex-item-fluid', !['note'].includes(field) && 'ellipsis'])}>
                    {getContent()}
                </span>
                <span className="flex-item-noshrink">{getActions()}</span>
            </div>
        </Row>
    );
};

ContactViewProperty.propTypes = {
    property: PropTypes.object.isRequired,
    properties: PropTypes.array,
    contactID: PropTypes.string.isRequired,
    contactEmail: PropTypes.object,
    contactGroups: PropTypes.arrayOf(PropTypes.object),
    leftBlockWidth: PropTypes.string,
    rightBlockWidth: PropTypes.string
};

export default ContactViewProperty;
