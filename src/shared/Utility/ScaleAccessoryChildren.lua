return function(acc : Accessory)
	local scale = Vector3.new(
		acc.Handle.Size.X / acc.Handle.OriginalSize.Value.X,
		acc.Handle.Size.Y / acc.Handle.OriginalSize.Value.Y,
		acc.Handle.Size.Z / acc.Handle.OriginalSize.Value.Z
	)

	local baseCFrame = acc.Handle.CFrame :: CFrame

	for _, child in pairs(acc:GetDescendants()) do
		if child.Name == "Handle" then
			continue
		end
		
		if child:IsA("BasePart") then
			child.Size = Vector3.new(
				child.Size.X * scale.X,
				child.Size.Y * scale.Y,
				child.Size.Z * scale.Z
			)

			local relativePos = baseCFrame:PointToObjectSpace(child.Position)
			local scaledRelativePos = relativePos * scale

			local diffVector = Vector3.new(
				scaledRelativePos.X - relativePos.X,
				scaledRelativePos.Y - relativePos.Y,
				scaledRelativePos.Z - relativePos.Z				
			)

			child.Position += diffVector		
		end
	end
end