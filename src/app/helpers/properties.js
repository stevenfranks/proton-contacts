/**
 * Make sure we keep only valid properties
 * In case adr property is badly formatted, re-format
 * @param {Array} properties
 * @returns {Array}
 */
export const sanitizeProperties = (properties = []) => {
    /*
        property values should be either arrays or strings
        transform to string otherwise (usually the case of a date for bday or anniversary fields)
        enforce value for adr field be an array
    */
    return properties
        .filter(({ value }) => value)
        .map((property) =>
            Array.isArray(property.value) ? property : { ...property, value: property.value.toString() }
        )
        .map((property) => {
            const { field, value } = property;
            if (field !== 'adr' || Array.isArray(value)) {
                return property;
            }
            // assume the bad formatting used commas instead of semicolons
            const newValue = value.split(',').slice(0, 6);
            return { ...property, value: newValue };
        });
};

/**
 * Add `pref` to email, adr, tel to save order
 * @param {Array} properties
 * @param {Array}
 */
export const addPref = (properties = []) => {
    const prefs = { email: 0, tel: 0, adr: 0 };
    return properties.map((property) => {
        if (!['email', 'adr', 'tel'].includes(property.field)) {
            return property;
        }

        const pref = (prefs[property.field] = prefs[property.field] + 1);

        return {
            ...property,
            pref
        };
    });
};

/**
 * Function that sorts properties by preference
 */
export const sortByPref = (firstEl, secondEl) => firstEl.pref <= secondEl.pref;

/**
 * Generate new group name that doesn't exist
 * @param {Array<String>} existingGroups
 * @returns {String}
 */
export const generateNewGroupName = (existingGroups = []) => {
    let index = 1;
    let found = false;

    while (!found) {
        if (existingGroups.includes(`item${index}`)) {
            index++;
        } else {
            found = true;
        }
    }

    return `item${index}`;
};

/**
 * Add `group` if missing for email.
 * @param {Array} properties
 * @returns {Array}
 */
export const addGroup = (properties = []) => {
    const existingGroups = properties.map(({ group }) => group);
    return properties.map((property) => {
        if (!['email'].includes(property.field) || property.group) {
            return property;
        }

        const group = generateNewGroupName(existingGroups);
        existingGroups.push(group);

        return {
            ...property,
            group
        };
    });
};

/**
 * Given an array of vCard properties (see notation in the file './csv.js'),
 * get the value for a certain field the first time it appears in the array
 * @param {Array<Object>}   properties
 * @param {String}          field
 *
 * @return {String,Array}
 */
export const getFirstValue = (properties, field) => {
    const { value } = properties.find(({ field: f }) => f === field) || {};
    return value;
};

/**
 * Given an array of vCard properties (see notation in the file './csv.js'),
 * get all the values for a certain field (which can appear several times in the array)
 * @param {Array<Object>}   properties
 * @param {String}          field
 *
 * @return {String,Array}
 */
export const getAllValues = (properties, field) => {
    return addPref(properties)
        .filter(({ field: f }) => f === field)
        .sort(sortByPref)
        .map(({ value }) => value);
};
