return function (originalObject, template)
    for key, value in pairs(template) do
        if originalObject[key] == nil then
            originalObject[key] = value
        end
    end

    return originalObject
end