import json as json
from collections import defaultdict


############################################################################
def give_epoch_color_dictionary():
	
	filename = '/home/laure/Documents/Data/Kurdistan_2018/Common_json_data/Epoch_colors.json'
	with open(filename, 'r') as f:
		epoch = json.load(f)
	
	return epoch


############################################################################
def give_epoch_color(init_age, final_age):
	
	med = (init_age + final_age) / 2
	
	epoch = give_epoch_color_dictionary()
	
	for key, epoch in epoch.iteritems():
		if med <= epoch['begin_age_Ma'] and med > epoch['end_age_Ma']:
			return epoch['color']
	
	print 'no color found for med age = ', med


############################################################################
def give_litho_rgb_color(litho):
	if litho == 'salt':
		return '#FABEF9'
	elif litho == 'limestone_early_diagenesis':
		return '#BEE2FA'
	elif litho == 'shale':
		return '#024408'
	elif litho == 'sandstone':
		return '#FFFF99'


############################################################################
def give_litho_pattern(litho):
	
	if litho == 'salt':
		return True
	elif litho == 'limestone_early_diagenesis':
		return '#/'
	elif litho == 'shale':
		return '#-'
	elif litho == 'sandstone':
		return '.'
	

###########################################################################
def add_epoch_colors_on_y_time_axis(ax, age_min, age_max):
	
	epoch_dict = give_epoch_color_dictionary()
	epoch_sorted = []
	
	# for epoch_name in epoch_dict.keys():
	# 	if epoch_dict[epoch_name]['end_age_Ma'] <= age_min <= epoch_dict[epoch_name]['begin_age_Ma']:
	# 		epoch_min = epoch_name
	# 	if epoch_dict[epoch_name]['end_age_Ma'] <= age_max <= epoch_dict[epoch_name]['begin_age_Ma']:
	# 		epoch_max = epoch_name
	#
	# # Time interval fill
	# for f in range(geometry.shape[0] - 1, 2, -1):  # Depth function of age
	# 	z_bottom = geometry[f, :]
	# 	init_age = event_agetable[len(event_agetable)-f-1]
	# 	final_age = event_agetable[len(event_agetable)-f]
	# 	col = plot_utils.give_epoch_color(init_age, final_age)
	# 	ax.fill_between(timetable, bathy, z_bottom, color=col, alpha=0.4)




