return function(s)
	if s < 3600 then
		return ("%02i:%02i"):format(s/60%60, s%60)
	end
	return ("%02i:%02i:%02i"):format(s/60^2, s/60%60, s%60) 
end