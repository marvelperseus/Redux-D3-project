import logging
import numpy as np
import json

import matplotlib
import matplotlib.pyplot as plt
from matplotlib.ticker import ScalarFormatter
from matplotlib.patches import Rectangle
from matplotlib.collections import PatchCollection
from matplotlib.patches import Patch
from matplotlib import gridspec

import Input as Input
import objects.utils as utils
import plot_utils as plot_utils


############################################################################
def plot(output_json_file, obstemp_filename, obsmat_filename, output_directory):

	with open(output_json_file, "r") as ofile:
		data_for_plot = json.load(ofile)

	mode = data_for_plot['bm_argument_data']['mode']
	option = data_for_plot['bm_argument_data']['option']

	model_name = data_for_plot['model_name']

	logging.info("****************** BUILDING GRAPHS ******************")

	# BURIAL HISTORY
	fig1 = plt.figure(figsize=(20, 10))
	ax = plt.subplot()
	plot_burial_history(data_for_plot, mode, ax)

	# Basin.plotPorosity(plt, mode)

	if option in ['Temperature', 'Pressure']:

		# MATURITY & TEMPERATURE & LITHOLOGY
		fig2, axes = plt.subplots(nrows=1, ncols=4,
					gridspec_kw={'width_ratios': [1, 2, 8, 8]},
					sharex='col',
					sharey=True,
					figsize=(20, 30))
		ax_litho = axes[0]
		ax_strati = axes[1]
		ax_temperature = axes[2]
		ax_maturity = axes[3]

		depth_min_max = give_min_max_tvdss(mode=mode, data_for_plot=data_for_plot)

		plot_litho(ax=ax_litho, data_for_plot=data_for_plot, depth_min_max=depth_min_max)

		plot_strati(ax=ax_strati, data_for_plot=data_for_plot, depth_min_max=depth_min_max)

		plot_present_day_temperature(ax=ax_temperature,
									obstemp_filename=obstemp_filename,
									depth_min_max=depth_min_max,
									data_for_plot=data_for_plot)

		plot_maturity(ax=ax_maturity,
					obsmat_filename=obsmat_filename,
					depth_min_max=depth_min_max,
					data_for_plot=data_for_plot)

	# if option['Pressure']:
	#
	# 	# PRESSURE
	# 	plot_pressure(basinmodel, plt, mode)
	#
	plt.suptitle(str(model_name), size='x-large')

	if mode == "StatisticalBasinModeling":

		plotfile = output_directory + "/" + str(model_name) + "_plots.png"
		plt.savefig(plotfile, format="png")
		plt.close('all')

	elif mode in ["BasinModeling", "WebApp"]:

		plt.show()


############################################################################
def plot_burial_history(data_for_plot, mode, ax):

	# Plot legend
	plt.xlabel('Age (Ma)')
	plt.ylabel('TVDss (m)')
	plt.title('Burial History')
	np.set_printoptions(precision=1, suppress=True)

	timetable = data_for_plot['bm_result']['timestep_timetable']
	geometry = np.array(data_for_plot['bm_result']['timestep_geometry'])
	event_agetable = data_for_plot['bm_result']['event_agetable']
	bathy = np.array(data_for_plot['bm_result']['timestep_bathy'])
	tecsubs = np.array(data_for_plot['bm_result']['timestep_tecsubs'])
	max_age_in_ma_for_plot = data_for_plot['bm_result']['max_age_in_ma_for_plot']
	min_age_in_ma_for_plot = data_for_plot['bm_result']['min_age_in_ma_for_plot']

	# Time interval fill
	for f in range(geometry.shape[0] - 1, 2, -1):  # Depth function of age
		z_bottom = geometry[f, :]
		init_age = event_agetable[len(event_agetable)-f-1]
		final_age = event_agetable[len(event_agetable)-f]
		col = plot_utils.give_epoch_color(init_age, final_age)
		ax.fill_between(timetable, bathy, z_bottom, color=col, alpha=0.4)

	# Plot data
	for f in range(geometry.shape[0]):  # Depth function of age
		z = geometry[f, :]
		plt.plot(timetable, z, linewidth=1)
	plt.plot(timetable, bathy, linewidth=1, color='b', linestyle='-')
	plt.plot(timetable, tecsubs, color='k', linestyle='--', linewidth=0.5)

	# Axis definition
	xmax = max_age_in_ma_for_plot
	ymax = -1000.
	if mode == "BasinModeling" or mode == "WebApp":  # Adapted to data to plot
		xmin = np.max(timetable)
		ymin = np.max(geometry[geometry.shape[0] - 1, :])
	elif mode == "StatisticalBasinModeling":  # Normalization for plot comparison
		xmin = min_age_in_ma_for_plot
		ymin = utils.plot_depth_min()

	plt.axis([xmin, xmax, ymin, ymax])

	plt.plot([xmin, xmax], [0, 0], 'k--', linewidth=0.2)

	# Vertical lines
	for a in event_agetable:
		plt.plot([a, a], [ymin, ymax], 'k--', linewidth=0.1)

	# Plot of isotherms
	# isotherme_val = sorted(self.isotherm.keys())
	# isotherme_color = ['r', 'r', 'r', 'r']
	# isotherme_style = [':','-.','--','-']
	# for ind_temp in range(len(isotherme_val)):
	# 	temperature = isotherme_val[ind_temp]
	# 	curve_style = isotherme_color[ind_temp] + isotherme_style[ind_temp]
	# 	age = self.isotherm[temperature]['age']
	# 	depth = self.isotherm[temperature]['depth']
	# 	plt.plot(age, depth, curve_style, linewidth=2, label=temperature)
	# 	plt.legend()

	# Plot of isomaturity (easyRo)
	# mat_val = sorted(self.isomat.keys())
	# isomat_color = ['r', 'r', 'r', 'r']
	# isomat_style = [':', '-.', '--', '-']
	# for ind_mat in range(len(mat_val)):
	# 	mat = mat_val[ind_mat]
	# 	curve_style = isomat_color[ind_mat] + isomat_style[ind_mat]
	# 	age = self.isomat[mat]['age']
	# 	depth = self.isomat[mat]['depth']
	# 	plt.plot(age, depth, curve_style, linewidth=1, label=mat)
	# 	plt.legend()


############################################################################
def plot_all_observed_data(observed_data, ax):

	if observed_data:
		obs_data = np.asarray(observed_data)
		well_names = obs_data[:, 0]
		well_name_list = list(set(obs_data[:, 0]))  # without duplicates
		yobs = obs_data[:, 1]
		xobs = obs_data[:, 2]
		well_colors = dict()
		colors = "bgrcmykw"
		color_index = 0
		for name in well_name_list:
			well_colors[name] = colors[color_index]
			color_index += 1
		for (i, name) in enumerate(well_names):
			x_pt = float(xobs[i])
			y_pt = float(yobs[i])
			ax.plot(x_pt, y_pt, color=well_colors[name], marker='o', label=name)

		# Legend
		handle_list, label_list = list(), list()
		handles, labels = ax.get_legend_handles_labels()
		for handle, label in zip(handles, labels):
			if label not in label_list:
				handle_list.append(handle)
				label_list.append(label)
		ax.legend(handle_list, label_list)


############################################################################
def plot_observed_data(obsdata_filename, ax, model_name):

	if obsdata_filename != '':

		obs_data = Input.read_observed_data(obsdata_filename)
		obs_data = np.asarray(obs_data)
		well_names = obs_data[:, 0]
		yobs = obs_data[:, 1]
		xobs = obs_data[:, 2]
		for (i, name) in enumerate(well_names):
			if name == model_name:
				x_pt = float(xobs[i])
				y_pt = float(yobs[i])
				ax.plot(x_pt, y_pt, color='r', marker='o', label='Observed data')

		# Legend
		handle_list, label_list = list(), list()
		handles, labels = ax.get_legend_handles_labels()
		for handle, label in zip(handles, labels):
			if label not in label_list:
				handle_list.append(handle)
				label_list.append(label)
		ax.legend(handle_list, label_list)


############################################################################
def plot_strati(ax, data_for_plot, depth_min_max):

	inputdata = data_for_plot['json_input_file']

	ymin = depth_min_max['min']
	ymax = depth_min_max['max']
	xmin = 0.
	xmax = 1.

	# Title and grid
	ax.set_title(label='Stratigraphy', fontweight='bold', fontsize=14)

	# Plot of lithology proportion
	stratigraphy(ax, inputdata, xmin, xmax)

	ax.axis([xmin, xmax, ymax, ymin])


############################################################################
def stratigraphy(ax, inputdata, xmin, xmax):

	dz = 100.
	dx = 0.05
	lw = 0.2

	z_above = inputdata['basinmodel']['layers'][0]['TopDepth'] - dz
	ax.text(x=xmin-2*dx,
			y=z_above,
			s='m',
			fontsize=6,
			horizontalalignment='right',
			verticalalignment='center')
	ax.text(x=xmax+2*dx,
			y=z_above,
			s='Ma',
			fontsize=6,
			horizontalalignment='left',
			verticalalignment='center')

	hz_depth, hz_age = list(), list()
	for formation in inputdata['basinmodel']['layers']:
		z_bottom = float(formation['BottomDepth'])
		z_top = float(formation['TopDepth'])

		if z_bottom != z_top:
			formation_name = formation['LayerName']

			init_age = float(formation['InitAge'])
			final_age = float(formation['FinalAge'])

			box_height = -(z_bottom - z_top)
			box_width = xmax - xmin
			polygon = Rectangle(xy=(xmin, z_bottom), width=box_width, height=box_height, fill=True)
			color = plot_utils.give_epoch_color(init_age, final_age)
			collection = PatchCollection([polygon],
										 facecolor=[color],
										 edgecolor='k',
										 linewidth=lw,
										 label=[formation_name],
										 alpha=0.7)
			ax.add_collection(collection)
			ax.set_aspect('auto')

			# Formation name
			ax.text(x=(xmin+xmax)/2,
					y=(z_bottom+0.5*box_height),
					s=formation_name,
					fontsize=6,
					horizontalalignment='center',
					verticalalignment='center')

			# Horizon depths
			for z in [z_bottom, z_top]:
				if z not in hz_depth:
					ax.text(x=xmin-0.1,
							y=z,
							s=str(int(z)),
							fontsize=6,
							horizontalalignment='right',
							verticalalignment='center')
					hz_depth.append(z)

			# Horizon age
			ax.text(x=xmax+dx,
					y=z_bottom,
					s=str(init_age),
					fontsize=6,
					horizontalalignment='left',
					verticalalignment='center')
			ax.text(x=xmax + dx,
					y=z_top,
					s=str(final_age),
					fontsize=6,
					horizontalalignment='left',
					verticalalignment='center')

	# Y axis ticks
	ylim = ax.axes.get_ylim()
	ax.yaxis.set_ticks_position('both')
	ax.set_yticks(hz_depth)
	ax.set_ylim(ylim)

	# X axis ticks
	ax.set_xticks([])


############################################################################
def plot_litho(ax, data_for_plot, depth_min_max):

	inputdata = data_for_plot['json_input_file']

	ymin = depth_min_max['min']
	ymax = depth_min_max['max']
	ystep = depth_min_max['step']
	xmin = 0.
	xmax = 100.
	xstep = 25.

	# X axis
	ax.set_xticks(np.arange(xmin, xmax, xstep))
	ax.set_ylabel('%')

	# Y axis
	ax.set_yticks(np.arange(ymin, ymax, ystep))
	ax.set_ylabel('TVDss (m)')

	# Title and grid
	ax.set_title(label='Lithology\nproportions', fontweight='bold', fontsize=14)
	ax.grid(True, which='both', color='lightgrey', linewidth=0.5)

	# Plot of lithology proportion
	vertical_litho_prop(ax, inputdata, xmin, xmax)

	ax.axis([xmin, xmax, ymax, ymin])


############################################################################
def plot_horizons_and_time_fill(timestep_geometry, ax, xmin, xmax):

	# Plot horizon
	for f in range(timestep_geometry.shape[0]):  # Depth function of age
		z = timestep_geometry[f, :]
		actual_z = z[-1]
		ax.plot([xmin, xmax], [actual_z, actual_z], 'k-', linewidth=0.2)

	# Time interval fill
	actual_z = list()
	color_list = ['#fff2ae', '#ffff99', '#ffff66', '#ffff41', '#fee6aa', '#fcb482', '#fca773', '#fca773', '#fdb462',\
				  '#f2fa8c', '#bfe35d', '#b3de53', '#ccea97', '#a6d975', '#d9f1f7', '#ccecf4', '#a6dde0', '#99cee3', \
				  '#80c5dd', '#4eb3d3', '#e3b9db', '#d6aad3', '#d6aad3', '#d6aad3']

	for f in range(1, timestep_geometry.shape[0], 1):  # Depth function of age
		z = timestep_geometry[f, :]
		actual_z.append(z[-1])
	for i in range(len(actual_z)-1):
		hz_depth = actual_z[i]
		below_hz_depth = actual_z[i+1]
		ax.plot([0., xmax], [hz_depth, hz_depth], 'k-', linewidth=0.2)
		ax.fill_between([0., xmax], [hz_depth, hz_depth], [below_hz_depth, below_hz_depth], color=color_list[i], alpha=0.4)


############################################################################
def plot_horizons(timestep_geometry, ax, xmin, xmax):

	# Plot horizon
	for f in range(timestep_geometry.shape[0]):  # Depth function of age
		z = timestep_geometry[f, :]
		actual_z = z[-1]
		ax.plot([xmin, xmax], [actual_z, actual_z], 'k-', linewidth=0.2)

	ax.set_facecolor('#F7F7F7')


############################################################################
def plot_present_day_temperature(ax, obstemp_filename, depth_min_max, data_for_plot):

	model_name = data_for_plot['model_name']
	temperature = np.array(data_for_plot['bm_result']['present_day_temperature'])
	burial_depth = np.array(data_for_plot['bm_result']['time_step_burial_depth'])
	bathy = np.array(data_for_plot['bm_result']['timestep_bathy'])
	timestep_geometry = np.array(data_for_plot['bm_result']['timestep_geometry'])

	ymin = depth_min_max['min']
	ymax = depth_min_max['max']
	xmin = 0.
	xmax = 150.
	xstep = 25.

	# X axis
	ax.set_xticks(np.arange(xmin, xmax, xstep))
	ax.set_xlabel('Temperature (deg Celsius)')

	# Y axis
	labels = [item.get_text() for item in ax.get_yticklabels()]
	empty_string_labels = [''] * len(labels)
	ax.set_yticklabels(empty_string_labels)

	# Title and grid
	ax.set_title(label='Present day Temperature', fontweight='bold', fontsize=14)
	ax.set_axisbelow(True)
	ax.grid(True, color='lightgrey', linewidth=0.5, alpha=0.5)

	# Observed data
	plot_observed_data(obstemp_filename, ax, model_name)

	# Plot data
	a = np.asarray(temperature)
	b = np.asarray(burial_depth) + bathy[-1]
	ax.plot(a, b, marker='o', color='k', markersize=3, linestyle='-', linewidth=0.4)
	ax.axis([xmin, xmax, ymax, ymin])

	plot_horizons(timestep_geometry, ax, xmin, xmax)


############################################################################
def vertical_litho_prop(ax, inputdata, xmin, xmax):

	litho_correspondance = {'shale': 'Clay', 'sandstone': 'Qtz', 'limestone_early_diagenesis': 'CO3', 'salt': 'Evap'}
	litho_list = ['shale', 'sandstone', 'limestone_early_diagenesis', 'salt']

	litho_lib = inputdata['lithology']

	color, patches, label = list(), list(), list()
	for formation in inputdata['basinmodel']['layers']:
		z_bottom = formation['BottomDepth']
		z_top = formation['TopDepth']
		if z_bottom != z_top:
			litho_name = formation['LithologyName']
			if 'volumic_proportions' in litho_lib[litho_name].keys():
				litho_volprop = litho_lib[litho_name]['volumic_proportions']
			else:
				litho_volprop = dict()
				litho_volprop[litho_name] = 1.
			box_height = -(z_bottom - z_top)
			x = xmin
			for l in litho_list:
				if l in litho_volprop.keys():
					box_width = litho_volprop[l] * xmax
					polygon = Rectangle(xy=(x, z_bottom), width=box_width, height=box_height, fill=True)
					x = x + box_width
					color.append(plot_utils.give_litho_rgb_color(l))
					patches.append(polygon)
					label.append(l)
			collection = PatchCollection(patches, facecolor=color, edgecolor='k', linewidth=0.2, label=label, alpha=1.)
			ax.add_collection(collection)
			ax.set_aspect('auto')

	# Save of lithology legend
	litho_handles, litho_label = list(), list()
	for litho in litho_list:
		color = plot_utils.give_litho_rgb_color(litho)
		p = Patch(facecolor=color, edgecolor='k')
		litho_handles.append(p)
		litho_label.append(litho_correspondance[litho])
	ax.legend(litho_handles, litho_label, loc=8, bbox_to_anchor=(0.5, -0.13))


############################################################################
def give_min_max_tvdss(mode, data_for_plot):

	burial_depth = np.array(data_for_plot['bm_result']['present_day_burial_depth'])
	bathy = np.array(data_for_plot['bm_result']['timestep_bathy'])

	if mode == "BasinModeling" or mode == "WebApp":  # Adapted to data to plot
		depth = np.asarray(burial_depth) + bathy[-1] # last element instead of first
		ymin = np.nanmin(depth)
		ymax = np.nanmax(depth)
		step = 500.
		ymax = int(ymax / 1000.) * 1000. + 5 * step
		ymin = int(ymin / 1000.) * 1000. - 2 * step
		return {'min': ymin, 'max': ymax, 'step': step}

	elif mode == "StatisticalBasinModeling":  # Normalization for plot comparison
		print 'ERROR in give_min_max_tvdss'
		# ymin = utils.plot_burial_depth_min()


############################################################################
def plot_maturity(ax, obsmat_filename, depth_min_max, data_for_plot):

	model_name = data_for_plot['model_name']
	maturity = np.array(data_for_plot['bm_result']['present_day_maturity'])
	burial_depth = np.array(data_for_plot['bm_result']['present_day_burial_depth'])
	bathy = np.array(data_for_plot['bm_result']['timestep_bathy'])
	timestep_geometry = np.array(data_for_plot['bm_result']['timestep_geometry'])

	ymin = depth_min_max['min']
	ymax = depth_min_max['max']
	xmin = 0.
	xmax = 2.
	xstep = 0.2

	# X axis
	ax.set_xscale('log')
	minor_ticks = np.arange(xmin, xmax, xstep)
	ax.set_xticks(minor_ticks, minor=True)
	ax.set_xlabel('EasyRo (%RoEq.)')
	ax.xaxis.set_major_formatter(matplotlib.ticker.FormatStrFormatter("%.1f"))
	ax.xaxis.set_minor_formatter(matplotlib.ticker.FormatStrFormatter("%.1f"))

	# Y axis
	labels = [item.get_text() for item in ax.get_yticklabels()]
	empty_string_labels = [''] * len(labels)
	ax.set_yticklabels(empty_string_labels)

	# Title and grid
	ax.set_title(label='Maturity vs. Depth', fontweight='bold', fontsize=14)
	ax.grid(True, which='both', color='lightgrey', linewidth=0.5)

	# Observed data
	plot_observed_data(obsmat_filename, ax, model_name)

	# Plot data
	a = np.asarray(maturity)
	b = np.asarray(burial_depth) + bathy[-1]
	ax.plot(a, b, marker='o', color='k', markersize=3, linestyle='-', linewidth=0.4)
	ax.axis([xmin, xmax, ymax, ymin])

	plot_horizons(timestep_geometry, ax, xmin, xmax)


############################################################################
def plot_pressure(basinmodel, plt, mode):

	plt.subplot(222)

	# Plot legend
	plt.xlabel('Pressure (MPa)')
	plt.ylabel('Depth (m)')
	plt.title('Pressure vs. Depth')

	# Plot data
	cellsed = []
	for i in range(len(basinmodel.pp[-1])):
		cellsed.append(basinmodel.cellCenters[-1][i])
	a = np.asarray(cellsed)
	b = 1e-6 * np.asarray(basinmodel.pp[-1])
	c = 1e-6 * np.asarray(basinmodel.phydro[-1])
	d = 1e-6 * np.asarray(basinmodel.sigmag[-1])
	plt.plot(b, a, 'o', b, a, label='pp')
	plt.plot(c, a, label='phydro')
	plt.plot(d, a, label='sigmag')
	plt.legend()

	# Axis definition
	xmin, ymax = 0.0, 0.0
	if mode == "BasinModeling" or mode == "WebApp":  # Adapted to data to plot
		xmax = 1e-6 * max(basinmodel.pp[-1])
		ymin = max(cellsed)
	elif mode == "StatisticalBasinModeling":  # Normalization for plot comparison
		xmax = utils.plot_pressure_max()
		ymin = utils.plot_depth_min()
	plt.axis([xmin, xmax, ymin, ymax])
	# logging.debug("plot_pressure {} {} {} {} {}".format(mode, xmin, xmax, ymin, ymax))



############################################################################
# def plotPorosity(self, plt, mode):
#
# 	plt.subplot(232)
#
# 	# Plot legend
# 	plt.xlabel('Porosity (%)')
# 	plt.ylabel('Depth (m)')
# 	plt.title('Porosity vs. Depth (present day)')
#
# 	# Data
# 	presentday = self.events[0].start
# 	# print presentday
# 	a, b = [], []
# 	for phi in self.sedimcolumn[presentday].phi:
# 		a.append(phi)
# 	for cc in self.sedimcolumn[presentday].cellcenters:
# 		b.append(cc)
# 	#
# 	# for i, s in reversed(list(enumerate(self.sedimcolumn[presentday].formations))):  # Construction of the geometry at currentT
# 	# 	print s.name
# 	# 	print s.cellcenter
# 	# 	print s.phi
# 	# 	b.append(s.cellcenter[-1])
# 	# 	a.append(s.phi[-1])
# 	b = np.asarray(b)
# 	a = 100 * np.asarray(a)
#
# 	# Plot data
# 	plt.plot(a, b, 'o', a, b)
#
# 	# Axis definition
# 	ymax = 0.0
# 	if mode == "BasinModeling":  # Adapted to data to plot
# 		xmin = np.min(a) - 5
# 		xmax = np.max(a) + 5
# 		ymin = np.max(b)
# 	plt.axis([xmin, xmax, ymin, ymax])
