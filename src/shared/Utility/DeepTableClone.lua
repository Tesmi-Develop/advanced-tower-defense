function deepTableClone(tableToClone)
    local result = {}

    for key, value in pairs( tableToClone ) do
        result[key] = type(value) == "table" and deepTableClone(value) or value
    end

    return result
end

return deepTableClone